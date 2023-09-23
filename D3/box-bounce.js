/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );
var paddle = vec2(-1.0,0.0);


// Stefna (og hraði) fernings
var dX;
var dY;



var paddleWidth = 0.2; 




// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var boxVertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);
var boxProgram;
var boxBufferId;
var vBoxPosition;



var paddleVertices = [
    vec2( -0.1, -0.9 ),
    vec2( -0.1, -0.86 ),
    vec2(  0.1, -0.86 ),
    vec2(  0.1, -0.9 ) 
];
var paddleProgram;
var paddleBufferId;
var vPaddlePosition;

function detectXOverlap(rect1, rect2) {
    var halfWidth1 = (rect1[1] - rect1[0]) / 2;
    var halfWidth2 = (rect2[1] - rect2[0]) / 2;
    
    if (Math.abs(rect1[0] - rect2[0]) <= (halfWidth1 + halfWidth2)) {
        return true; // Overlap 
    }

    return false; // No overlap
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    boxProgram = initShaders( gl, "box-vertex-shader", "box-fragment-shader" );
    gl.useProgram( boxProgram );
    
    // Load the data into the GPU
    boxBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, boxBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(boxVertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    vBoxPosition = gl.getAttribLocation( boxProgram, "vBoxPosition" );
    gl.vertexAttribPointer( vBoxPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vBoxPosition );

    locBox = gl.getUniformLocation( boxProgram, "boxPos" );


    
    paddleProgram = initShaders( gl, "paddle-vertex-shader", "paddle-fragment-shader" );
    gl.useProgram( paddleProgram );
    
    // Load the data into the GPU
    paddleBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, paddleBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(paddleVertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPaddlePosition = gl.getAttribLocation( paddleProgram, "vPosition" );
    gl.vertexAttribPointer( vPaddlePosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPaddlePosition );
    locPaddle = gl.getUniformLocation( paddleProgram, "paddlePos" );







    
    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp ör
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40:	// niður ör
                dX /= 1.1;
                dY /= 1.1;
                break;
        }
    } );
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                paddle[0] -= 0.1;
                break;
            case 39:	// hægri ör
            paddle[0]  += 0.1;
                break;
            default:
                paddle[0]  += 0.0;
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddleVertices));
    } );
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );


    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    if (detectXOverlap([paddle[0] - paddleWidth / 2, paddle[0] + paddleWidth / 2], [box[0] - boxRad, box[0] + boxRad]) && (box[1] <= -0.8)    ) {
        dY = -dY;
    } else {
    }

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    


    
    gl.useProgram( boxProgram );
    gl.bindBuffer(gl.ARRAY_BUFFER, boxBufferId);
    gl.vertexAttribPointer(vBoxPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vBoxPosition);
    gl.uniform2fv( locBox, flatten(box) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );



    gl.useProgram( paddleProgram );
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBufferId);
    gl.vertexAttribPointer(vPaddlePosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPaddlePosition);
    gl.uniform2fv( locPaddle, flatten(paddle) );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );




    window.requestAnimFrame(render);

}
