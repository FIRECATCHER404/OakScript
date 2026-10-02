#version 450
layout(location = 0) in vec3 Position;
layout(location = 1) in vec2 UV;
layout(location = 2) in vec4 Color;
layout(set = 0, binding = 0) uniform TransformBlock { mat4 Transform; };
layout(location = 0) out vec2 fsUV;
layout(location = 1) out vec4 fsColor;
void main() {
    gl_Position = Transform * vec4(Position, 1);
    gl_Position.y = -gl_Position.y;
    fsUV = UV;
    fsColor = Color;
}
