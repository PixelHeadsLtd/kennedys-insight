import * as d3 from 'd3';

// Draw multiline text on SVG

export interface DrawMultilineTextOptions {
    svg: d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>;
    x: number;
    y: number;
    lines: string[];
    fontSize?: string;
    fontstyle?: string;
    fontWeight?: string;
    fontFamily?: string;
    fill?: string;
    lineHeight?: number;
    textanchor?: string;
    r?: number;
    stroke?: string;
    strokeFill?: string;
    strokeWidth?: number;
    delay?: number;
    flyIn?: boolean;
    flyDirection?: 'left' | 'top' | 'right';
    dotGap?: number;
    E?: string;
    onTextClick?: () => void;
}


export function drawMultilineText(options: DrawMultilineTextOptions) {
    const {
        svg,
        x,
        y,
        lines,
        fontSize = '6.5px',
        fontstyle = 'normal',
        fontWeight = 'normal',
        fontFamily = 'Segoe UI, sans-serif',
        fill = 'white',
        lineHeight = 9,
        textanchor = '',
        r = 2.8,
        stroke,
        strokeFill = stroke,
        strokeWidth = 0,
        delay = 0,
        flyIn = true,
        flyDirection = 'left',
        dotGap = 5,
        E = '',
    } = options;
    {

        let startX = x;
        let startY = y;

        if (flyIn) {
            if (flyDirection === 'left') startX = x - 20;
            else if (flyDirection === 'right') startX = x + 20;
            else if (flyDirection === 'top') startY = y - 20;
        }

        const text = svg.append('text')
            .attr('x', startX)
            .attr('y', startY)
            .style('font-family', fontFamily)
            .style('font-size', fontSize)
            .style('font-style', fontstyle)
            .style('font-weight', fontWeight)
            .attr('text-anchor', textanchor)
            .style('fill', fill)
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .on('mouseover', function() {
                d3.select(this).style('cursor', 'pointer');
                if (E === 'B') {
                    d3.select(this).style('font-weight', 'bold');
                } else if (E === 'C') {
                    d3.select(this).style('fill', 'yellow');
                }
            })
            .on('mouseout', function() {
                if (E === 'B') {
                    d3.select(this).style('font-weight', fontWeight);
                } else if (E === 'C') {
                    d3.select(this).style('fill', fill);
                }
            })
            .on('click', function() {
                if (typeof options.onTextClick === 'function') {
                    options.onTextClick();
                }
            });

        const tspans = text.selectAll('tspan')
            .data(lines)
            .enter()
            .append('tspan')
            .attr('x', startX)
            .attr('dy', (_: string, i: number) => i === 0 ? 0 : lineHeight)
            .text((d: string) => d);

        if (flyIn) {
            text.transition()
                .duration(1000)
                .delay(delay)
                .attr('x', x)
                .attr('y', y)
                .style('opacity', 1);

            tspans.transition()
                .duration(1000)
                .delay(delay)
                .attr('x', x);
        } else {
            text.attr('x', x).attr('y', y).style('opacity', 1);
            tspans.attr('x', x);
        }

        if (stroke && stroke.trim() !== '') {
            const fillValue = typeof strokeFill === 'string' ? strokeFill : (stroke || 'none');
            if (fillValue === 'none') {
                svg.append('circle')
                    .attr('cx', x - dotGap)
                    .attr('cy', y - 2.5)
                    .attr('r', r)
                    .attr('fill', 'none')
                    .attr('stroke', stroke)
                    .attr('stroke-width', strokeWidth)
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .delay(delay + 800)
                    .style('opacity', 1);
            } else {
                svg.append('circle')
                    .attr('cx', x - dotGap)
                    .attr('cy', y - 2.5)
                    .attr('r', r)
                    .attr('fill', fillValue)
                    .attr('stroke', 'none')
                    .attr('stroke-width', strokeWidth)
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .delay(delay + 800)
                    .style('opacity', 1);
            }
        }
        }
    }

    export interface DrawDottedLineOptions {
        svg: d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>;
        startX: number;
        startY: number;
        slantAngle?: number;
        slantLength?: number;
        horizLength1?: number;
        horizLength2?: number;
        direction1?: 'left' | 'right';
        direction2?: 'left' | 'right';
        lineColor?: string;
        lineWidth?: number;
        dotRadius?: number;
        dotColor?: string;
        animationDelay?: number;
    }

    export function drawDottedLineWithSlantAndDot(options: DrawDottedLineOptions): void {
        const {
            svg,
            startX,
            startY,
            slantAngle = 65,
            slantLength = 50,
            horizLength1 = 100,
            horizLength2 = 60,
            direction1 = 'right',
            direction2 = 'left',
            lineColor = 'white',
            lineWidth = 0.5,
            dotRadius = 2,
            dotColor = 'white',
            animationDelay = 0
        } = options;

        const angleRad = slantAngle * Math.PI / 180;
        const slantEndX = startX + slantLength * Math.cos(angleRad);
        const slantEndY = startY - slantLength * Math.sin(angleRad);

        const horiz1EndX = direction1 === 'right'
            ? slantEndX + horizLength1
            : slantEndX - horizLength1;

        const horiz2EndX = direction2 === 'right'
            ? slantEndX + horizLength2
            : slantEndX - horizLength2;

        function drawAnimatedLine(x1: number, y1: number, x2: number, y2: number, delay = 0) {
            const line = svg.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x1)
                .attr('y2', y1)
                .attr('stroke', lineColor)
                .attr('stroke-width', lineWidth)
                .attr('stroke-dasharray', '2,2')
                .style('opacity', 0);

            line.transition()
                .delay(delay)
                .duration(800)
                .style('opacity', 1)
                .attr('x2', x2)
                .attr('y2', y2)
                .ease(d3.easeCubicOut);
        }

        drawAnimatedLine(startX, startY, slantEndX, slantEndY, animationDelay);
        drawAnimatedLine(slantEndX, slantEndY, horiz1EndX, slantEndY, animationDelay + 300);
        drawAnimatedLine(slantEndX, slantEndY, horiz2EndX, slantEndY, animationDelay + 300);

        svg.append('circle')
            .attr('cx', startX)
            .attr('cy', startY)
            .attr('r', 0)
            .attr('fill', dotColor)
            .style('filter', 'url(#glow)')
            .transition()
            .delay(animationDelay + 700)
            .duration(400)
            .attr('r', dotRadius);
    }