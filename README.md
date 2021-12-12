# Markdown Converter

## What is this?

Convert markdown to HTML file.

### Convert simply

Simply convert for markdown to html.

ex) markdown.md => markdown.html

### Convert to splitted pages

make any htmls from single markdown, split with H2(##) element.

ex) markdown.md in 3 H2 elements,created 4 htmls.

1. markdown.0.html
2. markdown.1.html
3. markdown.2.html
4. markdown.3.html

When, markdown.0.html includes content, before of first H2 element.

## How to run

It is simply way, using docker image.

```shell
docker run --rm -v $(pwd):/app/site hikaruright/markdown-converter
```
