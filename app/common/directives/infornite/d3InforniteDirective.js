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
                    self.chartType = options && options.chartType ? options.chartType : 'force';
                    self.newNodesArr = [];

                    self.treeLayout = d3.layout.tree();
                    self.forceLayout = d3.layout.force().gravity(0.04).charge(-210).linkDistance(210);
                    self.svgDiagonal = d3.svg.diagonal().projection(function (d) {
                        return [d.y, d.x];
                    });

                    self.zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]).on("zoom", fnZoomed);
                    self.drag = d3.behavior.drag()
                        .on("dragstart", fnDragStarted)
                        .on("drag", fnDragged)
                        .on("dragend", fnDragEnded);

                    // initialize svg
                    self.svg = d3.select(self.chartId).append('svg').attr('class', 'd3-infornite-svg');
                    // build the arrow.
                    self.svg.append("defs").selectAll("marker")
                        .data(["end"])
                        .enter().append("marker")
                        .attr("id", function (d) {
                            return d;
                        })
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 15)
                        .attr("refY", 0)
                        .attr("markerWidth", 9)
                        .attr("markerHeight", 5)
                        .attr("orient", "auto")
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5");
                    self.chartWrapper = self.svg.append('g').attr("class", 'infornite-graph-wrapper').call(self.zoom).on("dblclick.zoom", null);
                    self.rect = self.chartWrapper.append("rect")
                        .style("cursor", "move").style("fill", "none").style("pointer-events", "all");
                    self.chartContainer = self.chartWrapper.append("g").attr("class", 'infornite-graph-container');
                    self.linksEle = self.chartContainer.append("g").attr("class", "links");
                    self.nodesEle = self.chartContainer.append("g").attr("class", "nodes");
                    self.newNodes = self.chartContainer.append("g").attr("class", "new-nodes");
                }

                d3Infornite.prototype.render = function () {
                    if (!self.parentEle.width()) {
                        return false;
                    }

                    self.chartWidth = self.parentEle.width() - self.margin.right - self.margin.left;
                    self.chartHeight = fnRatio(self.chartWidth) * self.chartWidth;

                    self.treeLayout.size([self.chartHeight, self.chartWidth - 200]);
                    self.forceLayout.size([self.chartWidth, self.chartHeight]);

                    //update svg elements to new dimensions
                    self.svg.attr('width', self.chartWidth + self.margin.right + self.margin.left)
                        .attr('height', self.chartHeight + self.margin.top + self.margin.bottom);

                    self.chartWrapper.attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');
                    self.rect.attr("width", self.chartWidth).attr("height", self.chartHeight);
                };

                d3Infornite.prototype.update = function (data) {
                    self.render();
                    // Filter node edges.
                    var nodesLen = data.nodes.length;
                    data.nodes = data.nodes.map(function (d, i) {
                        d.index = i;
                        return d;
                    });
                    data.edges = data.edges.filter(function (d) {
                        return 0 < d.source && d.source < nodesLen && 0 < d.target && d.target < nodesLen;
                    });

                    // TODO : Get tree index 5 data remove once API give proper response.
                    self.treeData = fnGenerateTree(angular.copy(data))[5];
                    self.nodes = self.treeLayout.nodes(self.treeData); // create the nodes array
                    self.links = self.treeLayout.links(self.nodes);  // creates the links array

                    if (self.chartType === 'force') {
                        self.forceLayout.nodes(self.nodes).links(self.links);
                        // Run the layout a fixed number of times.
                        // The ideal number of times scales with graph complexity.
                        self.forceLayout.start();
                        for (var len = self.nodes.length, intIndex = len * len; intIndex > 0; --intIndex) {
                            self.forceLayout.tick();
                        }
                        self.forceLayout.stop();
                        fnRecursive(self.treeData);
                    }
                    self.redraw();
                };

                d3Infornite.prototype.redraw = function () {

                    /*----- START : Create edges -----*/
                    // Update links
                    self.link = self.linksEle.selectAll('.link').data(self.links);

                    // Enter links
                    self.link.enter().append('path')
                        .attr('class', 'link')
                        .style('fill', 'none')
                        .style('stroke', '#ccc')
                        .style('stroke-width', 2)
                        .attr("marker-end", "url(#end)");

                    // Remove link object with data
                    self.link.exit().remove();
                    /*----- END : Create edges -----*/


                    /*----- START : Create nodes -----*/
                    self.node = self.nodesEle.selectAll('.node').data(self.nodes);

                    // enter selection
                    self.nodeEnter = self.node.enter().append('g')
                        .attr('id', function (d) {
                            return d.data.index;
                        })
                        .attr('class', 'node');
                    self.nodeEnter.append('circle').attr('class', 'node-circle');
                    self.nodeEnter.append('text').attr('class', 'center-text');
                    self.nodeEnter.append('text').attr('class', 'node-label');
                    self.nodeEnter.append('circle').attr('class', 'notify-circle');
                    self.nodeEnter.append('text').attr('class', 'notify-text');

                    // update selection
                    self.node.attr('class', 'node')
                        .style("cursor", "pointer")
                        .call(self.drag);

                    self.node.select('.node-circle')
                        .style('fill', function (d) {
                            return d.color ? d.color : '#4682b4';
                        });

                    self.node.select('.center-text')
                        .attr("x", 0)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style('fill', '#fff')
                        .text(function (d) {
                            return d.name.charAt(0).toUpperCase();
                        });

                    self.node.select('.node-label')
                        .attr("x", 21)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "start")
                        .style('fill', '#000')
                        .text(function (d) {
                            return d.data.metadata.name;
                        });

                    self.node.select('.notify-circle')
                        .attr("r", 8)
                        .attr("transform", "translate(15,-15)")
                        .style("cursor", "pointer")
                        .style("fill", "red")
                        .style('display', function (d) {
                            return (d.children || d._children) ? 'block' : 'none';
                        })
                        .on("click", fnToggleNode);

                    self.node.select('.notify-text')
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .attr("transform", "translate(15,-15)")
                        .style('fill', '#fff')
                        .style('font-size', '11px')
                        .style('display', function (d) {
                            return (d.children || d._children) ? 'block' : 'none';
                        })
                        .on("click", fnToggleNode)
                        .text(function (d) {
                            return d._children ? d._children.length : 0;
                        });

                    // Remove nodes object with data
                    self.node.exit().remove();
                    /*----- END : Create nodes -----*/

                    self.visualization();
                };

                d3Infornite.prototype.addNewNode = function (newNodeData) {
                    newNodeData.index = self.nodes.length + self.newNodesArr.length;
                    self.newNodesArr.push(newNodeData);
                    var node = self.newNodes.selectAll('.new-node').data(self.newNodesArr);

                    // enter selection
                    var nodeEnter = node.enter().append('g');
                    nodeEnter.append('line');
                    nodeEnter.append('circle');
                    nodeEnter.append('text').attr("class", "node-center");
                    nodeEnter.append('text').attr("class", function (d) {
                        return 'node-label-' + d.id;
                    });

                    // update selection
                    node.attr('class', 'new-node')
                        .attr('id', function (d) {
                            return "new-node-node-" + d.index;
                        })
                        .attr('transform', function (d, i) {
                            var x = d.x ? d.x : 40,
                                y = d.y ? d.y : ((i + 1) * 40);
                            return 'translate(' + x + ',' + y + ')';
                        })
                        .style("cursor", "pointer")
                        .on("dblclick", function () {
                            if (d3.select(this).attr('draw-line')) {
                                d3.select(this).attr('draw-line', null);
                            } else {
                                d3.select(this).attr('draw-line', 'true');
                            }
                        })
                        .call(self.drag);

                    node.select("line")
                        .attr('x1', 0).attr('y1', 0)
                        .style("stroke", "#ccc")
                        .style('stroke-width', 2);

                    node.select('circle')
                        .attr("r", 20).style('fill', '#4682b4');

                    node.select('text.node-center')
                        .attr("x", 0)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style('fill', '#fff')
                        .text(function (d) {
                            return d.metadata.name.charAt(0).toUpperCase();
                        });

                    nodeEnter.append('foreignObject')
                        .attr("class", function (d) {
                            return 'externalObject fo-' + d.id;
                        })
                        .attr("width", 100)
                        .attr("height", 100)
                        .attr("x", 21)
                        .attr("y", -11)
                        .append("xhtml:div")
                        .html(function (d) {
                            var inputText = document.createElement("input");
                            inputText.setAttribute('type', 'text');
                            inputText.setAttribute('id', d.id);
                            inputText.setAttribute('class', 'new-label-input');
                            inputText.setAttribute('placeholder', 'Add label');
                            inputText.setAttribute('style', 'border: 1px solid #ccc;');
                            inputText.setAttribute('value', d.metadata.name);
                            return new XMLSerializer().serializeToString(inputText);
                        });

                    node.selectAll('.externalObject').select('input')
                        .on('change', function () {
                            var id = $(this).attr('id'),
                                val = $(this).val();
                            node.select('.node-label-' + id)
                                .attr("x", 21)
                                .attr("dy", ".35em")
                                .attr("text-anchor", "start")
                                .style('fill', '#000')
                                .text(val);
                            node.select('.fo-' + id).attr('id', function (d) {
                                d.metadata.name = val;
                            });
                            node.select('.fo-' + id).remove();
                        });

                    // Remove nodes object with data
                    node.exit().remove();
                };

                d3Infornite.prototype.visualization = function () {
                    if (self.chartType === 'tree') {
                        self.treeLayout.nodes(self.treeData);  	// recalculate tree layout

                        // transition link paths
                        self.link.attr("d", self.svgDiagonal);
                        // transition node groups
                        self.node
                            .attr("transform", function (d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            });
                        self.node.select('.node-circle').attr("r", 15);
                    } else if (self.chartType === 'force') {
                        self.node.select('.node-circle')
                            .attr("r", function (d) {
                                return (d.weight * 2) + 15;
                            });
                        fnTick();
                    }
                };

                function fnTick() {
                    self.link.attr("d", function (d) {
                        var dr = 0;
                        return "M" + d.source.fx + "," + d.source.fy + "A" +
                            dr + "," + dr + " 0 0,1 " + d.target.fx + "," + d.target.fy;
                    });

                    self.node.attr('transform', function (d) {
                        return 'translate(' + d.fx + ', ' + d.fy + ')';
                    });
                }

                function fnZoomed() {
                    self.chartContainer.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
                }

                function fnGenerateTree(object) {
                    var o = {}, children = {};

                    object.nodes.forEach(function (a, i) {
                        o[i] = {name: a.label[1], data: a};
                    });

                    object.edges.forEach(function (a) {
                        if (o[a.target] && o[a.source]) {
                            o[a.target].parent = o[a.source].name;
                            o[a.source].children = o[a.source].children || [];
                            o[a.source].children.push(o[a.target]);
                            children[a.target] = true;
                        }
                    });

                    return Object.keys(o).filter(function (k) {
                        return !children[k];
                    }).map(function (k) {
                        return o[k];
                    });
                }

                // Toggle children on click.
                function fnToggleNode(d) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    fnUpdateNodeAndLinks();
                }

                function fnUpdateNodeAndLinks() {
                    self.nodes = self.treeLayout.nodes(self.treeData); // create the nodes array
                    self.links = self.treeLayout.links(self.nodes);  // creates the links array
                    self.redraw();
                }

                function fnDragStarted(d) {
                    d3.event.sourceEvent.stopPropagation();
                }

                function fnDragged(d) {
                    if (d) {
                        if (d3.select(this).attr('class') === 'new-node') {
                            if (d3.select(this).attr('draw-line')) {
                                if (d3.select(this).attr('id') !== d3.event.sourceEvent.toElement.parentNode.id) {
                                    var obj = d3.event.sourceEvent.toElement.__data__;
                                    if (obj && !obj.children) {
                                        obj.children = [];
                                    }
                                    d.parentObj = obj;
                                }
                                if (!d.x && !d.y) {
                                    d.x = d3.event.x;
                                    d.y = d3.event.y;
                                }
                                d3.select(this).select('line').attr('x2', (d3.event.x - d.x)).attr('y2', (d3.event.y - d.y));
                            } else {
                                d.x = d3.event.x;
                                d.y = d3.event.y;
                                d3.select(this).attr('transform', 'translate(' + d3.event.x + ', ' + d3.event.y + ')');
                            }
                        } else {
                            if (self.chartType === 'force') {
                                d.fx += d3.event.dx;
                                d.fy += d3.event.dy;
                                fnTick();
                            }
                        }
                    }
                }

                function fnDragEnded(d) {
                    if (d3.select(this).attr('class') === 'new-node') {
                        d3.select(this).select('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 0);
                        if (d.parentObj) {
                            var nodeObj = {
                                name: d.label[1],
                                data: d,
                                x: d.x,
                                y: d.y,
                                px: d.x,
                                py: d.y,
                                fx: d.x,
                                fy: d.y,
                                weight: 1
                            };
                            d.parentObj.children.push(nodeObj);
                            fnUpdateNodeAndLinks();
                            // Remove new node from dom
                            var index = self.newNodesArr.map(function (d) {
                                return d.id;
                            }).indexOf(d.id);
                            if (index > -1) {
                                self.newNodesArr.splice(index, 1);
                            }
                            d3.select('#new-node-node-' + d.index).remove();
                        }
                    }
                }

                function fnRecursive(obj) {
                    angular.forEach(obj, function (val, key) {
                        if (key === 'x') {
                            obj.fx = obj.x;
                        }
                        if (key === 'y') {
                            obj.fy = obj.y;
                        }
                        if (key === "children" || typeof key === "number") {
                            fnRecursive(val);
                        }
                    });
                    return obj;
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

                    var toggle = angular.element('#ss_toggle');
                    var menu = angular.element('#ss_menu');
                    var rot, chart;

                    /*---- START: Add Node Button Click Menu -----*/
                    toggle.on('click', function (ev) {
                        rot = parseInt($(this).data('rot')) - 180;
                        menu.css('transform', 'rotate(' + rot + 'deg)');
                        menu.css('webkitTransform', 'rotate(' + rot + 'deg)');
                        if ((rot / 180) % 2 === 0) {
                            //Moving in
                            toggle.parent().addClass('ss_active');
                            toggle.addClass('close');
                            menu.find('.option').each(function (i) {
                                var className = 'menu' + (i + 1);
                                angular.element(this).addClass(className);
                            });
                        } else {
                            //Moving Out
                            toggle.parent().removeClass('ss_active');
                            toggle.removeClass('close');
                            menu.find('.option').each(function (i) {
                                var menuName = 'menu' + (i + 1);
                                angular.element(this).removeClass(menuName);
                            });
                        }
                        angular.element(this).data('rot', rot);
                    });
                    /*---- END: Add Node Button Click Menu -----*/

                    chart = new d3Infornite({chartId: 'infornite'});
                    chart.update(angular.copy($scope.data));

                    $scope.fnAddNewNode = function (text) {
                        var newNodeData = {
                            "id": Date.now(),
                            "label": ["entity", text],
                            "type": "",
                            "metadata": {"dateCreated": Date.now(), "name": text, "description": ""}
                        };
                        chart.addNewNode(newNodeData);
                    };

                    $scope.fnChangeChartView = function () {
                        if (chart.chartType === 'tree') {
                            chart.chartType = 'force';
                        } else {
                            chart.chartType = 'tree';
                        }
                        chart.visualization();
                    };
                }
            };
        }]);

}());