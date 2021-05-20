import fs from "fs";
import path from "path";
import sharp from "sharp";
import validUrl from "valid-url";
import parseCommandLineArgs from "./parse-command-line-args";
import parseFormCsv from "./parse-form-csv";
import parseImages, { ImageInfo } from "./parse-images";
import { trim } from "./utils";

/** Represents the parsed data for a student's work. */
type StudentWork = {
  id: string;
  startTime: string;
  completionTime: string;
  email: string;
  name: string;
  title: string;
  credit: string;
  images: ImageInfo[];
  link: string;
  description: string;
  isCourseWork: boolean;
  course: string;
};

/** Represents the hosted URLs of optimized and resized images. */
type ResizedImageInfo = {
  smallWpUrl: string;
  largeWpUrl: string;
  smallLocalUrl: string;
  largeLocalUrl: string;
};

/**
 * Parse the given CSV path into an array of StudentWork objects.
 */
async function parseStudentWork(formDataPath: string, csvPath: string): Promise<StudentWork[]> {
  const rawData = await parseFormCsv(csvPath);

  const processedData: StudentWork[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const trimmed = rawData[i].map(trim);
    const [
      id,
      startTime,
      completionTime,
      email,
      name,
      title,
      credit,
      imageString,
      link,
      description,
      isCourseWorkString,
      course,
    ] = trimmed;

    if (link !== "" && !validUrl.isUri(link)) {
      console.warn(`Invalid link detected with entry id ${id}: "${link}"`);
    }

    // Generate image data and check that images have been downloaded.
    const images = parseImages(imageString, id, formDataPath);

    const containsName = processedData.findIndex((d) => d.name === name) !== -1;
    const isCourseWork = isCourseWorkString === "Yes";
    if (!containsName) {
      processedData.push({
        id,
        startTime,
        completionTime,
        email,
        name,
        title,
        credit,
        images,
        link,
        description,
        isCourseWork,
        course,
      });
    } else {
      console.warn(
        `Multiple work submitted by the same student ${name} - using only the 1st submission.`
      );
    }
  }

  return processedData;
}

/**
 * Clear the output directory and remake it.
 */
function clearOutputDirectory(outputDirectory: string, outputImagesDirectory: string) {
  fs.rmdirSync(outputDirectory, { recursive: true });
  fs.mkdirSync(outputDirectory);
  fs.mkdirSync(outputImagesDirectory);
}

/**
 * Copy over images to the output directory and optimize them by generating two compressed sizes.
 */
async function generateImages(
  studentWork: StudentWork[],
  outputImagesDirectory: string,
  wpImagesUrl: string
): Promise<ResizedImageInfo[][]> {
  const resizedImages: ResizedImageInfo[][] = [];

  for (const work of studentWork) {
    const { images } = work;
    const studentImages: ResizedImageInfo[] = [];

    for (const imgInfo of images) {
      const { localPath, fileName, extension } = imgInfo;
      const resizeInfo: ResizedImageInfo = {
        smallWpUrl: "",
        largeWpUrl: "",
        smallLocalUrl: "",
        largeLocalUrl: "",
      };

      try {
        const input = sharp(localPath);
        const outputSmallPath = `${outputImagesDirectory}/${fileName}_600.jpg`;
        const outputLargePath = `${outputImagesDirectory}/${fileName}_1920.jpg`;
        await input
          .clone()
          .resize({ width: 600, height: undefined, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(outputSmallPath);
        await input
          .clone()
          .resize({ width: 1920, height: undefined, withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toFile(outputLargePath);
        resizeInfo.smallWpUrl = `${wpImagesUrl}/${fileName}_600.jpg`;
        resizeInfo.largeWpUrl = `${wpImagesUrl}/${fileName}_1920.jpg`;
        resizeInfo.smallLocalUrl = outputSmallPath;
        resizeInfo.largeLocalUrl = outputLargePath;
      } catch (err) {
        console.warn(
          `Unsupported image format: "${extension}". Copying "${fileName}" without optimizing.`
        );
        const path = `${outputImagesDirectory}/${fileName}${extension}`;
        fs.copyFileSync(localPath, path);
        resizeInfo.smallWpUrl = `${wpImagesUrl}/${fileName}${extension}`;
        resizeInfo.largeWpUrl = `${wpImagesUrl}/${fileName}${extension}`;
        resizeInfo.smallLocalUrl = path;
        resizeInfo.largeLocalUrl = path;
      }

      studentImages.push(resizeInfo);
    }

    resizedImages.push(studentImages);
  }

  return resizedImages;
}

/**
 * Build two HTML strings - one for local testing and one for the WordPress post. The HTML can be
 * viewed in a local browser for quick development. The WP HTML can be pasted into the "text" tab of
 * the WP post editor.
 */
function buildHtml(
  studentWork: StudentWork[],
  resizedImages: ResizedImageInfo[][]
): [string, string] {
  // We need two separate HTML strings here because the URLs are different for local dev vs the
  // published post AND because WP is finicky when it comes to whitespace.
  let html = "";
  let post = "";

  html += `
    <h1 id="top">Showcase</h1>
    <p>Thanks to all the students who submitted work this semester! Explore their work by scrolling through the post or jumping to specific student's work via these links:
    ${studentWork.map((w) => `<a href="#student-${w.id}">${w.name}</a>`).join(", ")}</p>
  `;

  post += `<h1 id="top">Showcase</h1>
Thanks to all the students who submitted work this semester! Explore their work by scrolling through the post or jumping to specific student's work via these links:
${studentWork.map((w) => `<a href="#student-${w.id}">${w.name}</a>`).join(", ")}
`;

  for (let i = 0; i < studentWork.length; i++) {
    const { id, title, credit, link, description, isCourseWork, course } = studentWork[i];
    const images = resizedImages[i];

    const imageWidth = 300;
    const imgHtml = images.map(({ smallLocalUrl, largeLocalUrl }, i) => {
      // Apply margin to create 10px of space between neighboring images.
      let style = `margin-left: 5px; margin-right: 5px;`;
      if (images.length === 1) style = "";
      else if (i === 0) style = `margin-right: 5px`;
      else if (i === images.length - 1) style = `margin-left: 5px`;

      const alt = `Screenshot #${i + 1} of ${title} by ${credit}`;
      return `<a href="${largeLocalUrl}"><img style="${style}" src="${smallLocalUrl}" width="${imageWidth}" alt="${alt}"/></a>`;
    });
    const imgPost = images.map(({ smallWpUrl, largeWpUrl }, i) => {
      // Apply margin to create 10px of space between neighboring images.
      let style = `margin-left: 5px; margin-right: 5px;`;
      if (images.length === 1) style = "";
      else if (i === 0) style = `margin-right: 5px`;
      else if (i === images.length - 1) style = `margin-left: 5px`;

      const alt = `Screenshot #${i + 1} of ${title} by ${credit}`;
      return `<a href="${largeWpUrl}"><img style="${style}" src="${smallWpUrl}" width="${imageWidth}" alt="${alt}"/></a>`;
    });

    const linkInfo = link ? `See more <a href="${link}">here</a>.` : "";
    const attributionLine = isCourseWork && course !== "" ? `${credit}, ${course}` : credit;

    html += `
    <h2 id="student-${id}"><a href="#student-${id}">${title}</a></h2>
    <p>${attributionLine}</p>
    <blockquote>${description}</blockquote>
    <p>${linkInfo}</p>
    ${imgHtml.join("\n")}
    <p><a href="#top">Back to top.</a></p>
    `;

    post += `<h2 id="student-${id}"><a href="#student-${id}">${title}</a></h2>
${attributionLine}
<blockquote>${description}</blockquote>
${linkInfo}

${imgPost.join("")}

<a href="#top">Back to top.</a>
&nbsp;`;
  }

  html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        html {
          font-size: 16px;
        }
        main {
          box-sizing: border-box;
          width: 100%;
          max-width: 1000px;
          padding: 0 1rem;
          margin: 0 auto;
        }
      </style>
  </head>
  <body>
    <main>
    ${html}
    </main>
  </body>
  </html>
  `;

  return [post, html];
}

async function main() {
  const { formDataPath, csvPath, outputDirectory, outputImagesDirectory, wpImagesUrl } =
    parseCommandLineArgs();
  const studentWork = await parseStudentWork(formDataPath, csvPath);

  clearOutputDirectory(outputDirectory, outputImagesDirectory);

  const resizedImages = await generateImages(studentWork, outputDirectory, outputImagesDirectory);

  const [post, html] = buildHtml(studentWork, resizedImages);
  fs.writeFileSync(path.join(outputDirectory, "local-test.html"), html);
  fs.writeFileSync(path.join(outputDirectory, "wordpress-post.html"), post);
}

main();
