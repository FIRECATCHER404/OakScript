#version 450
layout(location=0) in vec2 fsUV;
layout(location=1) in vec4 fsColor;
layout(set=1,binding=0) uniform texture2D SurfaceTexture;
layout(set=1,binding=1) uniform sampler SurfaceSampler;
layout(location=0) out vec4 OutputColor;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main() {
    vec2 uv = fsUV;
    vec3 sky = mix(vec3(0.42,0.68,0.84),vec3(0.78,0.87,0.89),smoothstep(0.0,0.8,uv.y));
    float aspect=abs(dFdy(uv.y))/max(abs(dFdx(uv.x)),0.000001);
    float sun=length(vec2((uv.x-0.78)*aspect,uv.y-0.20));
    sky += vec3(0.15,0.10,0.03)*exp(-sun*8.0);
    sky = mix(sky,vec3(1.0,0.94,0.73),1.0-smoothstep(0.039,0.042,sun));
    vec2 p=uv*vec2(5.0,14.0)+vec2(3.2,5.0);
    float cloud=noise(p)*0.55+noise(p*2.1)*0.28+noise(p*4.2)*0.17;
    float band=smoothstep(0.04,0.16,uv.y)*(1.0-smoothstep(0.39,0.56,uv.y));
    float opacity=smoothstep(0.55,0.68,cloud)*band*0.70;
    sky=mix(sky,vec3(0.94,0.96,0.94),opacity);
    OutputColor=vec4(sky,1.0)*fsColor*texture(sampler2D(SurfaceTexture,SurfaceSampler),vec2(0.5));
}
