# Student Showcase

This is a CLI tool to generate a WordPress blog post showcasing student work from the results of a Microsoft Form.

## Installation

Make sure that you have node and npm installed (see installer [here](https://nodejs.org/en/)). Clone this repository, open up a terminal window in this folder and run:

```
npm install
```

## Workflow

The workflow of using this tool to generate a blog post involves a few steps.

### Getting the Microsoft Form Data

When you create a Microsoft Group and link a Microsoft Form to it, the results are dumped into that group's documents in two ways:

1. The "/Apps/Microsoft Forms/SurveyName" folder in the contains any attachments folks submitted to the form.
2. If you click "Open in Excel" from Microsoft Forms, there is an excel file created at the root of the documents area.

You can download both of these via Sharepoint. This tools assumes that you've downloaded the SurveyName folder (e.g. if the form is called "FA20 Showcase", then go into "Apps" then "Microsoft Forms" and download & unzip "FA20 Showcase") and the associated excel file. Once you've downloaded them:

1. Place them into a folder within this project, e.g. a "Form Export" folder.
2. Convert the excel file to a CSV and clean up anything (e.g. typos in submitted links).

For internal reference, the forms we've used so far are stored under a private group and can be found [here](https://www.office.com/launch/forms/groupforms?auth=2&groupId=b18f8157-a718-4790-8d8a-d3ed505aa712).

### Running the Tool

With the data in place locally, you can run the tool. This will generate an output folder (defaults to a folder named "out") with: optimized images, a local-test.html file for testing, and a wordpress-post.html file for copy & pasting into WordPress.

1. Configure the command line arguments passed to the "start" command within the "package.json". This is how the CLI knows where your csv file is, where the images are, etc. You can run `npm run help` for more information on the command line arguments (see help info below).
2. Run the node script to generate the optimized image and WordPress post HTML by opening a terminal window and running `npm run start`. This may generate warnings about broken links, duplicate work, etc. It's okay to ignore duplicate work warnings, but the rest should be investigated and fixed. 
3. Test the generated HTML (local-test.html) in a local browser to verify images/links/etc. are working.

Help info for command line arguments:

```
Usage: index [options]

Options:
  -p, --path <path>    Local path to download of the files from sharepoint (relative to the root of this project)
  -c, --csv <path>     Local path to the CSV (relative to the root of this project)
  -w, --wpUrl <path>   URL path to where the image files will be hosted on WordPress. We use a URL that is relative to the post's URL 
                       to keep WordPress from converting the images to a JetPack CDN URL since these images aren't added via
                       JetPack/the media library (e.g. ../wp-content/uploads/showcases/2020-fall).
  -o, --output <path>  Local path to store the generated images and HTML.
  -m, --allowMultiple  Flag to allow multiple submissions from a student to be included in the showcase. (default: false)
  -h, --help           display help for command
```

### Uploading to WordPress

Getting the post into WordPress requires uploading the images and then copying & pasting the post HTML into a new post. 

1. Upload the images using the "WP File Manager" plugin. Place them into "wp-content/uploads/showcases" in a folder following the "year-semester" template, e.g. "2020-fall". The path here needs to match the one you used in the command line arguments in the previous section.
2. Create the new blog post.
   1. Paste in the contents of "post.html" into the post editor (under the "text" tab, not the "visual" tab).
   2. Set the categories to: News, Students and Work. Work is what makes the showcase show up on the main landing page.
   3. Set a featured image for the post. Collages can be easily generated using: https://www.befunky.com/create/collage/. I generate it at 1920x1080 with no spacing and save it as a JPG with 80% quality.

### Backup

After all that, back up any necessary files for future reference. I recommend zipping up the "Form Export", the showcase collage, etc. and uploading to Sharepoint.

## Future Improvements

- Form updates:
  - Only allow english character names in image files?
  - Crosslist with class catalog somehow?
- Right now, the image uploading to WordPress bypasses the media library, so it doesn't take full advantage of image optimization. Look into https://wordpress.org/plugins/add-from-server/ - this requires updating WordPress.