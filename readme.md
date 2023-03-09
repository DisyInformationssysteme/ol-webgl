Small example that uses a WebGl to render many points and lines.

Basically it uses the OL default shaders for this but adapts the one for points to use a SDF to look like a point instead of a rectangle.
This technique can also be used to make the lines look like arrows.

# running

```sh
npm install
npm run serve
```

# resource

The chapter Algorithmic Drawing is of interest.

https://thebookofshaders.com/

Functions for constructing various 2d shapes.

https://iquilezles.org/articles/distfunctions2d/

MDN Best Practices, contains tips to ensure compatability across devices.

https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
