function setForegroundColorRGB(r, g, b) {
    var RGB = new RGBColor();
    RGB.red = r;
    RGB.green = g;
    RGB.blue = b;
    
    var sColor = new SolidColor();
    sColor.rgb = RGB;
    
    app.foregroundColor = sColor;
    
    //app.togglePalettes();    app.togglePalettes();
};

function getForegroundColorRGB() {
    var json = "{\"r\":\"" + app.foregroundColor.rgb.red +
             "\", \"g\":\"" + app.foregroundColor.rgb.green +
             "\", \"b\":\"" + app.foregroundColor.rgb.blue + "\"}";
    json = '/*' + json + '*/'; // Wrap the JSON
};