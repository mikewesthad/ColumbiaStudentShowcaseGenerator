# Student Showcase

This is a CLI tool to generate a WordPress blog post showcasing student work from the results of a Microsoft Form.

## Process

1. Download the form excel results and the corresponding folder of images.
2. Convert the excel file to a CSV and clean up anything (e.g. typos in submitted links). Make note of anything cleaned up.
3. Run the node script to generate the images and post.
   1. This may generate warnings about broken links, duplicate work, etc. It's okay to ignore duplicate work warnings, but the rest should be investigated and fixed. 
4. Test the generated HTML (index.html) in a local browser before uploading to verify images/links/etc. are working.
5. Upload the images using the "WP File Manager" plugin. Place them into "wp-content/uploads/showcases" in a folder following the "year-semester" template, e.g. "2020-fall".
6. Create the new blog post
   1. Paste in the contents of "post.html" into the post editor (under the "text" tab, not the "visual" tab).
   2. Set the categories to: News, Students and Work. Work is what makes the showcase show up on the main landing page.
   3. Set a featured image for the post. Collages can be easily generated using: https://www.befunky.com/create/collage/. I generate it at 1920x1080 with no spacing and save it as a JPG with 80% quality.

## Todo

- Clean up and commit code.
- Exclude PDFs from future showcases.
- Look into https://wordpress.org/plugins/add-from-server/ to get jetpack image optimization working. This requires updating WordPress.
- Add note about "Relative URL skips photon, go up a dir from the post's url"