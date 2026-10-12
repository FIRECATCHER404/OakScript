#version 450
layout(location=0) in vec2 fsUV;
layout(location=1) in vec4 fsColor;
layout(location=2) in vec3 fsWorld;
layout(set=1,binding=0) uniform texture2D SurfaceTexture;
layout(set=1,binding=1) uniform sampler SurfaceSampler;
layout(location=0) out vec4 OutputColor;
void main() {
    vec3 n = normalize(cross(dFdx(fsWorld),dFdy(fsWorld)));
    // Standard face UVs sample the dedicated PNG, including its fine details.
    vec3 albedo = fsColor.rgb * texture(sampler2D(SurfaceTexture,SurfaceSampler),fsUV).rgb;
    vec3 sun = normalize(vec3(-0.45,0.85,-0.30));
    float diffuse = max(dot(n,sun),0.0);
    vec3 ambient = mix(vec3(0.45,0.47,0.50),vec3(0.62,0.68,0.74),n.y*0.5+0.5);
    vec3 light = ambient + vec3(0.47,0.40,0.29)*diffuse;
    vec3 shaded = albedo*light;
    // Alpha 254 in vertex color tags the game's opaque lantern faces.
    if(fsColor.a<0.998) shaded = albedo*1.12+vec3(0.10,0.045,0.01);
    // Reciprocal fragment W is camera-space depth with Oak's +Z projection.
    float depth = 1.0/max(gl_FragCoord.w,0.00001);
    float fog = 1.0-exp(-pow(depth/54.0,2.0));
    shaded = mix(shaded,vec3(0.73,0.83,0.87),fog);
    OutputColor = vec4(clamp(shaded,0.0,1.0),1.0);
}
