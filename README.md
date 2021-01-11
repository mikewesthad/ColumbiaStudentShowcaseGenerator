# Student Showcase

This is a CLI tool to generate a WordPress blog post showcasing student work from the results of a Microsoft Form.

## Installation

Make sure that you have node and npm installed (see installer [here](https://nodejs.org/en/)). Clone this repository, open up a terminal window in this folder and run:

```
npm install
```

## Workflow

The workflow of using this tool to generate a blog post involves a few steps:

1. Download the form excel results and the corresponding folder of submissions from sharepoint. Place them into a folder within this repository, e.g. a "Form Export" folder.
2. Convert the excel file to a CSV and clean up anything (e.g. typos in submitted links). Make note of anything cleaned up.
3. Configure the command line arguments passed to the "start" command within the "package.json". This is how the CLI knows where your csv file is, where the images are, etc. You can run `npm run help` for more information on the command line arguments.
4. Run the node script to generate the optimized image and WordPress post HTML by opening a terminal window and running `npm run start`. This may generate warnings about broken links, duplicate work, etc. It's okay to ignore duplicate work warnings, but the rest should be investigated and fixed. 
5. Test the generated HTML (index.html) in a local browser before uploading to verify images/links/etc. are working.
6. Upload the images using the "WP File Manager" plugin. Place them into "wp-content/uploads/showcases" in a folder following the "year-semester" template, e.g. "2020-fall".
7. Create the new blog post
   1. Paste in the contents of "post.html" into the post editor (under the "text" tab, not the "visual" tab).
   2. Set the categories to: News, Students and Work. Work is what makes the showcase show up on the main landing page.
   3. Set a featured image for the post. Collages can be easily generated using: https://www.befunky.com/create/collage/. I generate it at 1920x1080 with no spacing and save it as a JPG with 80% quality.
8. Back up any necessary files (e.g. cleaned CSV, collage, etc.) to the sharepoint.

## Todo

- Clean up and commit code.
- Exclude PDFs from future showcases.
- Look into https://wordpress.org/plugins/add-from-server/ to get jetpack image optimization working. This requires updating WordPress.
- Add note about "Relative URL skips photon, go up a dir from the post's url"