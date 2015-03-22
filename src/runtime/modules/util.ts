/**
 * Converts rgb value to string understood by css and canvas
 * @param r Amount of red
 * @param g Amount of green
 * @param b Amount of blue
 * @returns Color value converted to string
 */
export function rgbToStyle(r: number, g: number, b: number) {
    var rgb = (r << 16) | (g << 8) | (b << 0);
    return '#' + ('000000' + rgb.toString(16)).substr(-6);
}
