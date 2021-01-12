import fs from "fs";
import path from "path";
import { trim } from "./utils";

export type ImageInfo = {
  localPath: string;
  originalUrl: string;
  fileName: string;
  extension: string;
};

/**
 * Generate image data for each image in the given form submission.
 * @param imageString - Semi-colon separated string of images from the form.
 * @param submissionId - The unique ID for this submission in the form.
 * @param formDataPath - The local path where the form data is downloaded, e.g. "../Form Export".
 */
export default function parseImages(
  imageString: string,
  submissionId: string,
  formDataPath: string
) {
  const images: ImageInfo[] = [];

  if (imageString !== "") {
    const parts = imageString.split(";").map(trim);
    parts.forEach((img, imgIndex) => {
      // Images are URI encoded, so they needed to be decoded to be used as a file path.
      const decodedUrl = decodeURIComponent(img);

      // The image URLs will point to a Sharepoint location. We have a local copy that matches the
      // same directory structure as the Sharepoint data, so we just need the path starting at
      // "Apps/Microsoft Forms".
      const parts = decodedUrl.split("/Apps/Microsoft Forms/");
      if (parts.length === 0) {
        console.warn(
          `Image URL format doesn't match expectation. Expected to find a URL with "/Apps/Microsoft Forms/" in it, but found this instead: \n${img}`
        );
        return;
      }

      // With the relative path in hand, we can join it with where the form data is located to find
      // an image's location.
      const localPath = path.normalize(path.join(formDataPath, parts[1]));

      if (!fs.existsSync(localPath)) {
        console.warn(
          `Missing local image detected with entry id ${submissionId}: couldn't find "${img}"`
        );
      } else {
        const { ext, name } = path.parse(localPath);
        const normalizedName = name.replace(/ /g, "");
        const fileName = `${submissionId}_${imgIndex}_${normalizedName}`;
        images.push({
          originalUrl: img,
          localPath,
          fileName,
          extension: ext,
        });
      }
    });
  }

  return images;
}
