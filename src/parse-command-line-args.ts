import path from "path";
import { Command } from "commander";
import pkgDir from "pkg-dir";

interface ShowcaseOptions {
  path: string;
  csv: string;
  wpUrl: string;
  output: string;
  allowMultiple: boolean;
}

export default function parseCommandLineArgs() {
  const program = new Command();

  program
    .requiredOption(
      "-p, --path <path>",
      "Local path to download of the files from sharepoint (relative to the root of this project)"
    )
    .requiredOption(
      "-c, --csv <path>",
      "Local path to the CSV (relative to the root of this project)"
    )
    .requiredOption(
      "-w, --wpUrl <path>",
      "URL path to where the image files will be hosted on WordPress. We use a URL that is relative to the post's URL to keep WordPress from converting the images to a JetPack CDN URL since these images aren't added via JetPack/the media library (e.g. ../wp-content/uploads/showcases/2020-fall)."
    )
    .requiredOption("-o, --output <path>", "Local path to store the generated images and HTML.")
    .option(
      "-m, --allowMultiple",
      "Flag to allow multiple submissions from a student to be included in the showcase.",
      false
    );

  program.parse(process.argv);

  const options = program.opts() as ShowcaseOptions;

  // Use the root to interpret all paths as relative to where the package.json is located.
  const root = pkgDir.sync()!;
  const formDataPath = path.resolve(path.relative(root, options.path));
  const csvPath = path.resolve(path.relative(root, options.csv));
  const outputDirectory = path.resolve(path.relative(root, options.output));
  const outputImagesDirectory = path.join(outputDirectory, "images");
  const wpImagesUrl = options.wpUrl;

  return {
    formDataPath,
    csvPath,
    outputDirectory,
    outputImagesDirectory,
    wpImagesUrl,
    allowMultiple: options.allowMultiple,
  };
}
