#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <emscripten.h>

extern "C" {

/**
 * Applies morphological opening, Gaussian blur, and thresholding based on the 
 * rembg `post_process` behavior.
 * 
 * @param maskData Pointer to the 8-bit single-channel mask image array (modifies in place)
 * @param width Image width
 * @param height Image height
 */
EMSCRIPTEN_KEEPALIVE
void process_mask(uint8_t* maskData, int width, int height) {
    // Wrap pointer in cv::Mat (1 channel, 8-bit unsigned)
    cv::Mat mask(height, width, CV_8UC1, maskData);

    // 1. Morphological Opening with a 3x3 disk (ellipse) kernel
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(3, 3));
    cv::morphologyEx(mask, mask, cv::MORPH_OPEN, kernel);

    // 2. Gaussian Blur with sigma=2
    cv::GaussianBlur(mask, mask, cv::Size(0, 0), 2.0);

    // 3. Thresholding (< 127 = 0, else 255)
    cv::threshold(mask, mask, 127, 255, cv::THRESH_BINARY);
}

/**
 * Applies a basic trimap-based cutout as an alternative to full ML alpha matting.
 * In a full production build, this would solve the Matting Laplacian, but for this 
 * WASM port we perform erosion and alpha compositing directly.
 * 
 * @param imgData Pointer to RGBA original image (4 channels)
 * @param maskData Pointer to the 8-bit single-channel mask (1 channel)
 * @param width Image width
 * @param height Image height
 * @param fgThreshold Foreground threshold 
 * @param bgThreshold Background threshold
 * @param erodeSize Structure size for erosion
 */
EMSCRIPTEN_KEEPALIVE
void alpha_matting_cutout(uint8_t* imgData, uint8_t* maskData, int width, int height, 
                          int fgThreshold, int bgThreshold, int erodeSize) {
    
    cv::Mat img(height, width, CV_8UC4, imgData);
    cv::Mat mask(height, width, CV_8UC1, maskData);

    // Create trimap
    cv::Mat isForeground, isBackground;
    cv::threshold(mask, isForeground, fgThreshold, 255, cv::THRESH_BINARY);
    cv::threshold(mask, isBackground, bgThreshold, 255, cv::THRESH_BINARY_INV);

    if (erodeSize > 0) {
        cv::Mat structure = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(erodeSize, erodeSize));
        cv::erode(isForeground, isForeground, structure);
        cv::erode(isBackground, isBackground, structure);
    }

    cv::Mat trimap(height, width, CV_8UC1, cv::Scalar(128));
    trimap.setTo(255, isForeground);
    trimap.setTo(0, isBackground);

    // For simplicity in the WASM edge-compute version, we use the trimap 
    // to softly blend the boundaries rather than solving the full sparse ML matrix.
    // We smooth the trimap to create a pseudo-alpha matte.
    cv::Mat alpha;
    cv::GaussianBlur(trimap, alpha, cv::Size(0, 0), 3.0);

    // Apply alpha to image (modifies imgData in place)
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            cv::Vec4b& pixel = img.at<cv::Vec4b>(y, x);
            uint8_t a = alpha.at<uint8_t>(y, x);
            pixel[3] = a; // Set alpha channel
        }
    }
}

} // extern "C"
