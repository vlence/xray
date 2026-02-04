# Xray

A simple tool to inspect the binary contents of files.

Another goal of xray is to make sense of the contents of
the file. For example if I input a video file I should be
able to see the metadata, video tracks, audio tracks,
etc.

## Design

It's just a single HTML page. No servers.

The two main things that Xray does is parse the contents
of the file and then render it. Multiple renderers may
share the same parser.
