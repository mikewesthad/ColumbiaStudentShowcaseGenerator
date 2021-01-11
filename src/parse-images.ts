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
 * @param baseImageUrl - The URL where the form data is found in sharepoint, e.g.
 * https://columbiacollege.sharepoint.com/sites/IAMStudentWork/Shared Documents/Apps/Microsoft Forms
 * @param formDataPath - The local path where the form data is downloaded, e.g. "../Form Export".
 */
export default function parseImages(
  imageString: string,
  submissionId: string,
  baseImageUrl: string,
  formDataPath: string
) {
  const images: ImageInfo[] = [];

  if (imageString !== "") {
    const parts = imageString.split(";").map(trim);
    parts.forEach((img, imgIndex) => {
      // Images are URI encoded, so they needed to be decoded to be used as a file path.
      const decodedUrl = decodeURIComponent(img);
      const localPath = path.normalize(decodedUrl.replace(baseImageUrl, formDataPath));

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
