#version 450
layout(location = 0) in vec2 fsUV;
layout(location = 1) in vec4 fsColor;
layout(set = 1, binding = 0) uniform texture2D SurfaceTexture;
layout(set = 1, binding = 1) uniform sampler SurfaceSampler;
layout(location = 0) out vec4 OutputColor;
void main() {
    vec4 sampleColor = texture(sampler2D(SurfaceTexture, SurfaceSampler), fsUV);
    OutputColor = vec4(sampleColor.b, sampleColor.r * 0.7, sampleColor.g, sampleColor.a) * fsColor;
}
