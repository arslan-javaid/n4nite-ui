(function () {
    'use strict';

    angular.module('app.directives.d3Infornite', ['app'])
        .directive('d3Infornite', ['d3', function (d3) {

            var d3Infornite;

            d3Infornite = (function () {
                var self, min_zoom = 0.1, max_zoom = 7,
                    margin = {top: 20, right: 20, bottom: 20, left: 20};

                function d3Infornite(options) {
                    self = this;

                    // set options for chart
                    self.margin = options && options.margin ? options.margin : margin;
                    self.chartId = options && options.chartId ? '#' + options.chartId : 'body';
                    self.parentEle = angular.element(self.chartId).parent();

                    self.force = d3.layout.force().charge(-200).linkDistance(50);
                    self.zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]).on("zoom", fnZoomed);
                    self.drag = d3.behavior.drag()
                        .on("dragstart", fnDragStarted)
                        .on("drag", fnDragged)
                        .on("dragend", fnDragEnded);

                    // initialize svg
                    self.svg = d3.select(self.chartId).append('svg').attr('class', 'd3-infornite-svg');
                    self.chartWrapper = self.svg.append('g').attr("class", 'infornite-graph-wrapper').call(self.zoom);
                    self.rect = self.chartWrapper.append("rect")
                        .style("cursor", "move").style("fill", "none").style("pointer-events", "all");
                    self.chartContainer = self.chartWrapper.append("g").attr("class", 'infornite-graph-container');
                    self.links = self.chartContainer.append("g").attr("class", "links");
                    self.nodes = self.chartContainer.append("g").attr("class", "nodes");
                }

                d3Infornite.prototype.render = function () {
                    if (!self.parentEle.width()) {
                        return false;
                    }
                    self.chartWidth = self.parentEle.width() - self.margin.right - self.margin.left;
                    self.chartHeight = fnRatio(self.chartWidth) * self.chartWidth;

                    self.force.size([self.chartWidth + margin.left + margin.right, self.chartHeight + margin.top + margin.bottom]);

                    //update svg elements to new dimensions
                    self.svg.attr('width', self.chartWidth + self.margin.right + self.margin.left)
                        .attr('height', self.chartHeight + self.margin.top + self.margin.bottom);

                    self.chartWrapper
                        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');

                    self.rect.attr("width", self.chartWidth).attr("height", self.chartHeight);
                };

                d3Infornite.prototype.update = function (data) {

                    // Filter node edges.
                    var nodesLen = data.nodes.length, links = data.edges.filter(function (d) {
                        return 0 < d.source && d.source < nodesLen && 0 < d.target && d.target < nodesLen;
                    });

                    self.force.nodes(data.nodes).links(links).start();

                    /*----- START : Create edges -----*/
                    // Update links
                    self.link = self.links.selectAll('.link').data(data.edges);

                    // Enter links
                    self.link.enter().append('line')
                        .attr('class', 'link')
                        .style('stroke', '#000')
                        .style('stroke-width', 2);

                    // Remove link object with data
                    self.link.exit().remove();
                    /*----- END : Create edges -----*/


                    /*----- START : Create nodes -----*/
                    self.node = self.nodes.selectAll('.node').data(data.nodes);

                    // enter selection
                    self.nodeEnter = self.node.enter().append('g').attr('class', 'node');
                    self.nodeEnter.append('circle');
                    self.nodeEnter.append('text');

                    // update selection
                    self.node.attr('class', 'node')
                        .attr("cx", function (d) {
                            return d.x;
                        })
                        .attr("cy", function (d) {
                            return d.y;
                        })
                        .call(self.drag);

                    self.node.select('circle')
                        .attr("r", function (d) {
                            return (d.weight * 2) + 15;
                        })
                        .style('fill', function (d) {
                            return d.color ? d.color : '#4682b4';
                        });

                    self.node.select('text')
                        .attr("x", 0)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style('fill', '#fff')
                        .text(function (d) {
                            return d.label[1].charAt(0).toUpperCase();
                        });

                    // Remove nodes object with data
                    self.node.exit().remove();
                    /*----- END : Create nodes -----*/

                    self.force.on('tick', function () {
                        self.link.attr('x1', function (d) {
                            return d.source.x;
                        }).attr('y1', function (d) {
                            return d.source.y;
                        }).attr('x2', function (d) {
                            return d.target.x;
                        }).attr('y2', function (d) {
                            return d.target.y;
                        });

                        self.node.attr('transform', function (d) {
                            return 'translate(' + d.x + ', ' + d.y + ')';
                        });
                    });

                    self.render();
                };

                function fnZoomed() {
                    self.chartContainer.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
                }

                function fnDragStarted() {
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).classed('dragging', true);
                    self.force.start();
                }

                function fnDragged(d) {
                    d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y);
                }

                function fnDragEnded() {
                    d3.select(this).classed('dragging', false);
                }

                function fnRatio(width) {
                    if (800 < width && width < 1024) {
                        return 0.5;
                    } else if (768 < width && width < 800) {
                        return 0.55;
                    } else if (640 < width && width < 768) {
                        return 0.55;
                    } else if (320 < width && width < 640) {
                        return 0.6;
                    } else if (width < 320) {
                        return 0.7;
                    }
                    return 0.43;
                }

                return d3Infornite;
            })();

            return {
                restrict: 'E',
                replace: true,
                scope: {
                    data: "="
                },
                templateUrl: 'common/directives/infornite/infornite.html',
                link: function ($scope, iElement, iAttrs) {
                    var chart = new d3Infornite({chartId: 'infornite'});
                    chart.update(angular.copy($scope.data));

                    $scope.fnAddNewNode = function () {
                        var newNodeObj = {
                            id: Date.now(),
                            label: ['entity', 'metric'],
                            type: '',
                            metadata: {},
                            color: 'green'
                        };
                        $scope.data.nodes.push(newNodeObj);
                        chart.update(angular.copy($scope.data));
                    };
                }
            };
        }]);

}());