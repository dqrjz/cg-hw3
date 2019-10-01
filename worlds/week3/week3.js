"use strict"

async function setup(state) {
    let libSources = await MREditor.loadAndRegisterShaderLibrariesForLiveEditing(gl, "libs", [
        { 
            key : "pnoise", path : "shaders/noise.glsl", foldDefault : true
        },
        {
            key : "sharedlib1", path : "shaders/sharedlib1.glsl", foldDefault : true
        },      
    ]);

    if (!libSources) {
        throw new Error("Could not load shader library");
    }


    // load vertex and fragment shaders from the server, register with the editor
    let shaderSource = await MREditor.loadAndRegisterShaderForLiveEditing(
        gl,
        "mainShader",
        { 
            onNeedsCompilation : (args, libMap, userData) => {
                const stages = [args.vertex, args.fragment];
                const output = [args.vertex, args.fragment];

                const implicitNoiseInclude = true;
                if (implicitNoiseInclude) {
                    let libCode = MREditor.libMap.get("pnoise");

                    for (let i = 0; i < 2; i += 1) {
                        const stageCode = stages[i];
                        const hdrEndIdx = stageCode.indexOf(';');
                        
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
                        output[i] = hdr + "\n#line 2 1\n" + 
                                    "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
                            stageCode.substring(hdrEndIdx + 1);

                        console.log(output[i]);
                    }
                }

                MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
                    output[0],
                    output[1],
                    libMap
                );
            },
            onAfterCompilation : (program) => {
                state.program = program;

                gl.useProgram(program);

                // Assign MVP matrices
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');

				state.uLightsLoc = [];
				var numLights = 2;
				for (var i = 0; i < numLights; i++) {
					var strL = 'uLights[';
					state.uLightsLoc[i] = {};
	                state.uLightsLoc[i].direction	= gl.getUniformLocation(program, strL.concat(i.toString(),'].direction'));
	                state.uLightsLoc[i].color 		= gl.getUniformLocation(program, strL.concat(i.toString(),'].color'));
				}
                // state.uLightsLoc[0] = {};
                // state.uLightsLoc[0].direction	= gl.getUniformLocation(program, 'uLights[0].direction');
                // state.uLightsLoc[0].color 		= gl.getUniformLocation(program, 'uLights[0].color');
                // state.uLightsLoc[1] = {};
                // state.uLightsLoc[1].direction	= gl.getUniformLocation(program, 'uLights[1].direction');
                // state.uLightsLoc[1].color 		= gl.getUniformLocation(program, 'uLights[1].color');

                state.uMaterialsLoc = [];
                state.uShapesLoc = [];
                var numMaterialsAndShapes = 5;
                for (var i = 0; i < numMaterialsAndShapes; i++) {
                	var strM = 'uMaterials[';
                	var strS = 'uShapes[';
                	state.uMaterialsLoc[i] = {};
	                state.uMaterialsLoc[i].ambient 		= gl.getUniformLocation(program, strM.concat(i.toString(),'].ambient'));
	                state.uMaterialsLoc[i].diffuse 		= gl.getUniformLocation(program, strM.concat(i.toString(),'].diffuse'));
	                state.uMaterialsLoc[i].specular 	= gl.getUniformLocation(program, strM.concat(i.toString(),'].specular'));
	                state.uMaterialsLoc[i].power 		= gl.getUniformLocation(program, strM.concat(i.toString(),'].power'));
	                state.uMaterialsLoc[i].reflect 		= gl.getUniformLocation(program, strM.concat(i.toString(),'].reflect'));
	                state.uMaterialsLoc[i].transparent 	= gl.getUniformLocation(program, strM.concat(i.toString(),'].transparent'));
	                state.uMaterialsLoc[i].indexOfRefraction 	= gl.getUniformLocation(program, strM.concat(i.toString(),'].indexOfRefraction'));

	                state.uShapesLoc[i] = {};
	                state.uShapesLoc[i].type 	= gl.getUniformLocation(program, strS.concat(i.toString(),'].type'));
	                state.uShapesLoc[i].center 	= gl.getUniformLocation(program, strS.concat(i.toString(),'].center'));
	                state.uShapesLoc[i].size	= gl.getUniformLocation(program, strS.concat(i.toString(),'].size'));
                }
                // state.uMaterialsLoc[0] = {};
                // state.uMaterialsLoc[0].ambient 	= gl.getUniformLocation(program, 'uMaterials[0].ambient');
                // state.uMaterialsLoc[0].diffuse 	= gl.getUniformLocation(program, 'uMaterials[0].diffuse');
                // state.uMaterialsLoc[0].specular = gl.getUniformLocation(program, 'uMaterials[0].specular');
                // state.uMaterialsLoc[0].power 	= gl.getUniformLocation(program, 'uMaterials[0].power');
                // state.uMaterialsLoc[0].reflect 	= gl.getUniformLocation(program, 'uMaterials[0].reflect');
                // state.uMaterialsLoc[0].transparent 	= gl.getUniformLocation(program, 'uMaterials[0].transparent');
                // state.uMaterialsLoc[0].indexOfRefraction 	= gl.getUniformLocation(program, 'uMaterials[0].indexOfRefraction');
                // state.uMaterialsLoc[1] = {};
                // state.uMaterialsLoc[1].ambient 	= gl.getUniformLocation(program, 'uMaterials[1].ambient');
                // state.uMaterialsLoc[1].diffuse 	= gl.getUniformLocation(program, 'uMaterials[1].diffuse');
                // state.uMaterialsLoc[1].specular = gl.getUniformLocation(program, 'uMaterials[1].specular');
                // state.uMaterialsLoc[1].power 	= gl.getUniformLocation(program, 'uMaterials[1].power');
                // state.uMaterialsLoc[1].reflect 	= gl.getUniformLocation(program, 'uMaterials[1].reflect');
                // state.uMaterialsLoc[1].transparent 	= gl.getUniformLocation(program, 'uMaterials[1].transparent');
                // state.uMaterialsLoc[1].indexOfRefraction 	= gl.getUniformLocation(program, 'uMaterials[1].indexOfRefraction');
                // state.uMaterialsLoc[2] = {};
                // state.uMaterialsLoc[2].ambient 	= gl.getUniformLocation(program, 'uMaterials[2].ambient');
                // state.uMaterialsLoc[2].diffuse 	= gl.getUniformLocation(program, 'uMaterials[2].diffuse');
                // state.uMaterialsLoc[2].specular = gl.getUniformLocation(program, 'uMaterials[2].specular');
                // state.uMaterialsLoc[2].power 	= gl.getUniformLocation(program, 'uMaterials[2].power');
                // state.uMaterialsLoc[2].reflect 	= gl.getUniformLocation(program, 'uMaterials[2].reflect');
                // state.uMaterialsLoc[2].transparent 	= gl.getUniformLocation(program, 'uMaterials[2].transparent');
                // state.uMaterialsLoc[2].indexOfRefraction 	= gl.getUniformLocation(program, 'uMaterials[2].indexOfRefraction');
                
                // state.uShapesLoc[0] = {};
                // state.uShapesLoc[0].type 	= gl.getUniformLocation(program, 'uShapes[0].type');
                // state.uShapesLoc[0].center 	= gl.getUniformLocation(program, 'uShapes[0].center');
                // state.uShapesLoc[0].size	= gl.getUniformLocation(program, 'uShapes[0].size');
                // state.uShapesLoc[1] = {};
                // state.uShapesLoc[1].type 	= gl.getUniformLocation(program, 'uShapes[1].type');
                // state.uShapesLoc[1].center 	= gl.getUniformLocation(program, 'uShapes[1].center');
                // state.uShapesLoc[1].size	= gl.getUniformLocation(program, 'uShapes[1].size');
                // state.uShapesLoc[2] = {};
                // state.uShapesLoc[2].type 	= gl.getUniformLocation(program, 'uShapes[2].type');
                // state.uShapesLoc[2].center 	= gl.getUniformLocation(program, 'uShapes[2].center');
                // state.uShapesLoc[2].size	= gl.getUniformLocation(program, 'uShapes[2].size');
            } 
        },
        {
            paths : {
                vertex   : "shaders/vertex.vert.glsl",
                fragment : "shaders/fragment.frag.glsl"
            },
            foldDefault : {
                vertex   : true,
                fragment : false
            }
        }
    );

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }


    // Create a square as a triangle strip consisting of two triangles
    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0, 1,1,0, -1,-1,0, 1,-1,0]), gl.STATIC_DRAW);

    // Assign aPos attribute to each vertex
    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
}

function normalize(vec3) {
  var norm = Math.sqrt(vec3[0] * vec3[0] + vec3[1] * vec3[1] + vec3[2] * vec3[2]);
  if (norm != 0) { // as3 return 0,0 for a point of zero length
    vec3[0] = vec3[0] / norm;
    vec3[1] = vec3[1] / norm;
    vec3[2] = vec3[2] / norm;
  }
  return vec3;
}

// NOTE: t is the elapsed time since system start in ms, but
// each world could have different rules about time elapsed and whether the time
// is reset after returning to the world
function onStartFrame(t, state) {
    // (KTR) TODO implement option so a person could pause and resume elapsed time
    // if someone visits, leaves, and later returns
    let tStart = t;
    if (!state.tStart) {
        state.tStart = t;
        state.time = t;
    }

    tStart = state.tStart;

    let now = (t - tStart);
    // different from t, since t is the total elapsed time in the entire system, best to use "state.time"
    state.time = now;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let time = now / 1000;

    gl.uniform1f(state.uTimeLoc, time);

    gl.uniform3fv(state.uLightsLoc[0].direction	, [.2,.5,.6]);
    gl.uniform3fv(state.uLightsLoc[0].color		, [.3,.3,.3]);
    gl.uniform3fv(state.uLightsLoc[1].direction	, [-.5,-.5,.1]);
    gl.uniform3fv(state.uLightsLoc[1].color		, [.2,.2,.2]);

    gl.uniform3fv(state.uMaterialsLoc[0].ambient , [.0001,.0001,.0001]);
    gl.uniform3fv(state.uMaterialsLoc[0].diffuse , [.0001,.0001,.0001]);
    gl.uniform3fv(state.uMaterialsLoc[0].specular, [.8,.8,.8]);
    gl.uniform1f (state.uMaterialsLoc[0].power   , 10.);
    gl.uniform3fv(state.uMaterialsLoc[0].reflect , [.9,.9,.9]);
    gl.uniform3fv(state.uMaterialsLoc[0].transparent , [1.,1.,1.]);
    gl.uniform1f (state.uMaterialsLoc[0].indexOfRefraction   , 1.7);

    gl.uniform3fv(state.uMaterialsLoc[1].ambient , [.2,.5,.3]);
    gl.uniform3fv(state.uMaterialsLoc[1].diffuse , [.5,.5,0.]);
    gl.uniform3fv(state.uMaterialsLoc[1].specular, [.3,.4,.5]);
    gl.uniform1f (state.uMaterialsLoc[1].power   , 20.);
    gl.uniform3fv(state.uMaterialsLoc[1].reflect , [.3,.5,.2]);
    gl.uniform3fv(state.uMaterialsLoc[1].transparent , [.6,.6,.7]);
    gl.uniform1f (state.uMaterialsLoc[1].indexOfRefraction   , 1.5);

    gl.uniform3fv(state.uMaterialsLoc[2].ambient , [.9,.5,.1]);
    gl.uniform3fv(state.uMaterialsLoc[2].diffuse , [.5,.7,.2]);
    gl.uniform3fv(state.uMaterialsLoc[2].specular, [.7,.3,.3]);
    gl.uniform1f (state.uMaterialsLoc[2].power   , 5.);
    gl.uniform3fv(state.uMaterialsLoc[2].reflect , [.4,.5,.9]);
    gl.uniform3fv(state.uMaterialsLoc[2].transparent , [.3,.3,.3]);
    gl.uniform1f (state.uMaterialsLoc[2].indexOfRefraction   , 1.2);

    gl.uniform3fv(state.uMaterialsLoc[3].ambient , [.7,.3,.5]);
    gl.uniform3fv(state.uMaterialsLoc[3].diffuse , [.8,.3,.9]);
    gl.uniform3fv(state.uMaterialsLoc[3].specular, [.3,.3,.8]);
    gl.uniform1f (state.uMaterialsLoc[3].power   , 10.);
    gl.uniform3fv(state.uMaterialsLoc[3].reflect , [.6,.3,.9]);
    gl.uniform3fv(state.uMaterialsLoc[3].transparent , [.7,.7,.7]);
    gl.uniform1f (state.uMaterialsLoc[3].indexOfRefraction   , 1.3);

    gl.uniform3fv(state.uMaterialsLoc[4].ambient , [.2,.2,.2]);
    gl.uniform3fv(state.uMaterialsLoc[4].diffuse , [.1,.3,.2]);
    gl.uniform3fv(state.uMaterialsLoc[4].specular, [.5,.5,.5]);
    gl.uniform1f (state.uMaterialsLoc[4].power   , 30.);
    gl.uniform3fv(state.uMaterialsLoc[4].reflect , [.8,.2,.3]);
    gl.uniform3fv(state.uMaterialsLoc[4].transparent , [.6,.6,.6]);
    gl.uniform1f (state.uMaterialsLoc[4].indexOfRefraction   , 1.7);

    gl.uniform1i (state.uShapesLoc[0].type	, 0);
    gl.uniform3fv(state.uShapesLoc[0].center, [0.,0.,0.]);
    gl.uniform1f (state.uShapesLoc[0].size	, .5);

    gl.uniform1i (state.uShapesLoc[1].type	, 1);
    gl.uniform3fv(state.uShapesLoc[1].center, [0.6*Math.sin(time-1.), 0.6*Math.sin(time-1.), 0.6*Math.cos(time-1.)]);
    gl.uniform1f (state.uShapesLoc[1].size	, .2);
    gl.uniform1i (state.uShapesLoc[2].type	, 1);
    gl.uniform3fv(state.uShapesLoc[2].center, [0.6*Math.sin(time+3.0), 0.6*Math.sin(time+3.0), 0.6*Math.cos(time+3.0)]);
    gl.uniform1f (state.uShapesLoc[2].size	, .2);

    gl.uniform1i (state.uShapesLoc[3].type	, 2);
    gl.uniform3fv(state.uShapesLoc[3].center, [-0.7*Math.sin(time+2.0), 0.7*Math.sin(time+2.0), 0.7*Math.cos(time+2.0)]);
    gl.uniform1f (state.uShapesLoc[3].size	, .2);
    gl.uniform1i (state.uShapesLoc[4].type	, 2);
    gl.uniform3fv(state.uShapesLoc[4].center, [-0.8*Math.sin(time),0.8*Math.sin(time),0.8*Math.cos(time)]);
    gl.uniform1f (state.uShapesLoc[4].size	, .2);

    gl.enable(gl.DEPTH_TEST);
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {
    const sec = state.time / 1000;

    const my = state;
  
    gl.uniformMatrix4fv(my.uModelLoc, false, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-1,1]));
    gl.uniformMatrix4fv(my.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(my.uProjLoc, false, new Float32Array(projMat));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week3',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}
