import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';

@Component({
    selector: 'app-diagram-editor',
    templateUrl: './diagram-editor.component.html',
    styleUrls: ['./diagram-editor.component.scss']
})
export class DiagramEditorComponent implements OnInit {
    private diagram: go.Diagram = new go.Diagram();
    private palette: go.Palette = new go.Palette();

    @ViewChild('diagramDiv')
    private diagramRef: ElementRef;

    @ViewChild('paletteDiv')
    private paletteRef: ElementRef;

    @Input()
    get model(): go.Model { return this.diagram.model; }
    set model(val: go.Model) { this.diagram.model = val; }

    @Output()
    nodeSelected = new EventEmitter<go.Part | null>();

    @Output()
    modelChanged = new EventEmitter<go.ChangedEvent | null>();

    @Output()
    modelAfterDeleted = new EventEmitter<go.DiagramEvent | null>();

    @Output()
    modelBeforeDeleted = new EventEmitter<go.DiagramEvent | null>();

    @Output()
    linkDrawn = new EventEmitter<go.DiagramEvent | null>();

    @Output()
    layoutCompletd = new EventEmitter<go.DiagramEvent | null>();

    @Output()
    reLinkDrawn = new EventEmitter<go.DiagramEvent | null>();

    constructor() {
        const $ = go.GraphObject.make;
        this.diagram = new go.Diagram();
        this.diagram.allowDrop = true;  // necessary for dragging from Palette
        this.diagram.allowDelete = false;
        this.diagram.allowCopy = false;
        this.diagram.undoManager.isEnabled = true;
        this.diagram.initialAutoScale = go.Diagram.Uniform;
        this.diagram.initialContentAlignment = go.Spot.TopCenter;
        this.diagram.contentAlignment = go.Spot.TopCenter;
        this.diagram.addDiagramListener("ChangedSelection",
            e => {
                const node = e.diagram.selection.first();
                this.nodeSelected.emit(node);
            });
        this.diagram.addDiagramListener("ExternalObjectsDropped", function(e) {
            const sel = e.diagram.selection;
            const elem = sel.first();
        });
        this.diagram.addDiagramListener("SelectionDeleting",
            e => {
                this.modelBeforeDeleted.emit(e);
            });
        this.diagram.addDiagramListener("SelectionDeleted",
            e => {
                this.modelAfterDeleted.emit(e);
            });
        this.diagram.addDiagramListener("LinkDrawn",
            e => {
                this.linkDrawn.emit(e);
            });
        this.diagram.addDiagramListener("LinkRelinked",
            e => {
                this.reLinkDrawn.emit(e);
            });
        this.diagram.addDiagramListener("LayoutCompleted",
            e => {
                this.layoutCompletd.emit(e);
            });
        this.diagram.addModelChangedListener(e => e.isTransactionFinished && this.modelChanged.emit(e));

        const lightText = 'whitesmoke';

        // ******************************Diagram node Template Design Changes *************************

        this.diagram.nodeTemplate =
            $(go.Node, "Auto",
                $(go.Shape, "RoundedRectangle", { strokeWidth: 0 },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    { margin: 8 },
                    new go.Binding("text", "key"))
            );

        this.diagram.nodeTemplateMap.add("Comment", // the diagram Comment category
            $(go.Node, "Auto", this.nodeStyle(),
                $(go.Shape, "File",
                    { fill: "#EFFAB4", stroke: null }),
                $(go.TextBlock,
                    {
                        margin: 5,
                        maxSize: new go.Size(200, NaN),
                        wrap: go.TextBlock.WrapFit,
                        textAlign: "center",
                        editable: true,
                        font: "bold 12pt Helvetica, Arial, sans-serif",
                        stroke: '#454545'
                    },
                    new go.Binding("text").makeTwoWay())
                // no ports, because no links are allowed to connect with a comment
            ));

        this.diagram.nodeTemplateMap.add("End", // the diagram End category
            $(go.Node, "Spot", this.nodeStyle(),
                $(go.Panel, "Auto",
                    $(go.Shape, "Circle",
                        { minSize: new go.Size(40, 40), fill: "#DC3C00", stroke: null }),
                    $(go.TextBlock, "End",
                        { font: "bold 8pt Helvetica, Arial, sans-serif", stroke: lightText },
                        new go.Binding("text"))
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "endTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "endLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "endRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.nodeTemplateMap.add("Start", // the diagram Start category
            $(go.Node, "Spot", this.nodeStyle(),
                $(go.Panel, "Auto",
                    $(go.Shape, "Circle",
                        { minSize: new go.Size(40, 40), fill: "#79C900", stroke: null }),
                    $(go.TextBlock, "Start",
                        { font: "bold 8pt Helvetica, Arial, sans-serif", stroke: lightText },
                        new go.Binding("text"))
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "startLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "startRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "startBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.nodeTemplateMap.add("Decision",  // the  diagram decision category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Diamond",
                        { fill: "#fd7e9d", stroke: null, desiredSize: new go.Size(125, 90) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 8pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "black",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "decisionTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "red",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "decisionLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "green",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "decisionRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     toMaxLinks: 1,
                //     fromMaxLinks: 1,
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                //     portId: "B",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // })
            ));

        this.diagram.nodeTemplateMap.add("Entity",  // the diagram Entity category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Output",
                        { fill: "#109ccf", stroke: null, desiredSize: new go.Size(125, 50) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 9pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ),

                $(go.Shape, "Circle", {
                    fill: "black",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "entityTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "entityLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "R",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "black",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "entityBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.nodeTemplateMap.add("Action",  // the diagram Action category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "CreateRequest",
                        { fill: "#faca6d", stroke: "white", desiredSize: new go.Size(125, 50) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 9pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "black",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "actionTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "actionLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "R",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "black",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "actionBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.nodeTemplateMap.add("Response",  // the diagram Response category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Output",
                        { fill: "#47caf0", stroke: null, desiredSize: new go.Size(125, 50) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 9pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "black",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "responseTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "responseLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "responseRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "black",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "responseBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.nodeTemplateMap.add("Intent",  // the diagram Intent category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Terminator",
                        { fill: "#51c69b", stroke: null, desiredSize: new go.Size(125, 50) },
                        new go.Binding("figure", "figure")
                    ),
                    $(go.TextBlock,
                        {
                            font: "bold 9pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                //     portId: "T",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                //     portId: "L",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                //     portId: "R",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                $(go.Shape, "Circle", {
                    fill: "black",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(6, 6),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "intentBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.diagram.linkTemplate = // the whole link panel
            $(go.Link,
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5, toShortLength: 4,
                    relinkableFrom: false,
                    relinkableTo: false,
                    reshapable: true,
                    resegmentable: true,
                    // mouse-overs subtly highlight links:
                    mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
                    mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
                },
                new go.Binding("points").makeTwoWay(),
                $(go.Shape,  // the highlight shape, normally transparent
                    { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
                $(go.Shape,  // the link path shape
                    { isPanelMain: true, stroke: "#4581ad", strokeWidth: 2 }),
                $(go.Shape,  // the arrowhead
                    { toArrow: "standard", stroke: null, fill: "#4581ad", scale: 1.5 }),
                $(go.Panel, "Auto",  // the link label, normally not visible
                    { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                    new go.Binding("visible", "visible").makeTwoWay(),
                    $(go.Shape, "RoundedRectangle",  // the label shape
                        { fill: "#F8F8F8", stroke: "black" }),
                    $(go.TextBlock, "Yes",  // the label
                        {
                            textAlign: "center",
                            font: "10pt helvetica, arial, sans-serif",
                            stroke: "#333333",
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                )
            );
        this.palette = new go.Palette();

        // ****************************** Palette (Side View) node Template Design Changes *************************

        this.palette.nodeTemplate =
            $(go.Node, "Auto",
                $(go.Shape, "RoundedRectangle", { strokeWidth: 0 },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    { margin: 8 },
                    new go.Binding("text", "key"))
            );

        this.palette.nodeTemplateMap.add("Comment", // the palette Comment category
            $(go.Node, "Auto", this.nodeStyle(),
                $(go.Shape, "File",
                    { fill: "#EFFAB4", stroke: null }),
                $(go.TextBlock,
                    {
                        margin: 5,
                        maxSize: new go.Size(200, NaN),
                        wrap: go.TextBlock.WrapFit,
                        textAlign: "center",
                        editable: true,
                        font: "bold 12pt Helvetica, Arial, sans-serif",
                        stroke: '#454545'
                    },
                    new go.Binding("text").makeTwoWay())
                // no ports, because no links are allowed to connect with a comment
            ));

        this.palette.nodeTemplateMap.add("End", // the palette End category
            $(go.Node, "Spot", this.nodeStyle(),
                $(go.Panel, "Auto",
                    $(go.Shape, "Circle",
                        { minSize: new go.Size(40, 40), fill: "#DC3C00", stroke: null }),
                    $(go.TextBlock, "End",
                        { font: "bold 8pt Helvetica, Arial, sans-serif", stroke: lightText },
                        new go.Binding("text"))
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "endTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "endLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "endRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.nodeTemplateMap.add("Start", // the palette Start category
            $(go.Node, "Spot", this.nodeStyle(),
                $(go.Panel, "Auto",
                    $(go.Shape, "Circle",
                        { minSize: new go.Size(40, 40), fill: "#79C900", stroke: null }),
                    $(go.TextBlock, "Start",
                        { font: "bold 8pt Helvetica, Arial, sans-serif", stroke: lightText },
                        new go.Binding("text"))
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "startLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "startRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "startBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.nodeTemplateMap.add("Decision",  // the  palette decision category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Diamond",
                        { fill: "#fd7e9d", stroke: null, desiredSize: new go.Size(80, 60) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 7.5pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "decisionTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "decisionLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "decisionRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     toMaxLinks: 1,
                //     fromMaxLinks: 1,
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                //     portId: "B",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // })
            ));

        this.palette.nodeTemplateMap.add("Entity",  // the palette Entity category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Output",
                        { fill: "#109ccf", stroke: null, desiredSize: new go.Size(80, 40) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 7.5pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "entityTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "entityLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "R",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),

                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "entityBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.nodeTemplateMap.add("Action",  // the palette Action category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "CreateRequest",
                        { fill: "#faca6d", stroke: "white", desiredSize: new go.Size(80, 40) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 7.5pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "actionTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "actionLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "R",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "actionBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.nodeTemplateMap.add("Response",  // the palette Response category
            $(go.Node, "Spot", this.nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Output",
                        { fill: "#47caf0", stroke: null, desiredSize: new go.Size(80, 40) },
                        new go.Binding("figure", "figure")),
                    $(go.TextBlock,
                        {
                            font: "bold 7.5pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ), $(go.Shape, "Circle", {
                    fill: "transparent",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                    portId: "responseTop",  // declare this object to be a "port"
                    fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                    portId: "responseLeft",  // declare this object to be a "port"
                    fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                    portId: "responseRight",  // declare this object to be a "port"
                    fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                    fromLinkable: false, toLinkable: true,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "responseBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.nodeTemplateMap.add("Intent",  // the palette Intent category
            $(go.Node, "Spot", this.nodeStyle(), { position: new go.Point(229, 40) },
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $(go.Panel, "Auto",
                    $(go.Shape, "Terminator",
                        { fill: "#51c69b", stroke: null, desiredSize: new go.Size(80, 40) },
                        new go.Binding("figure", "figure")
                    ),
                    $(go.TextBlock,
                        {
                            font: "bold 7.5pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text").makeTwoWay())
                ),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Top, alignmentFocus: go.Spot.Top,  // align the port on the main Shape
                //     portId: "T",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Top, toSpot: go.Spot.Top,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,  // align the port on the main Shape
                //     portId: "L",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Left, toSpot: go.Spot.Left,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                // $(go.Shape, "Circle", {
                //     fill: "transparent",
                //     stroke: null,  // this is changed to "white" in the showPorts function
                //     desiredSize: new go.Size(8, 8),
                //     alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,  // align the port on the main Shape
                //     portId: "R",  // declare this object to be a "port"
                //     fromSpot: go.Spot.Right, toSpot: go.Spot.Right,  // declare where links may connect at this port
                //     fromLinkable: false, toLinkable: false,  // declare whether the user may draw links to/from here
                //     cursor: "pointer"  // show a different cursor to indicate potential link point
                // }),
                $(go.Shape, "Circle", {
                    fill: "transparent",
                    toMaxLinks: 1,
                    fromMaxLinks: 1,
                    stroke: null,  // this is changed to "white" in the showPorts function
                    desiredSize: new go.Size(3, 3),
                    alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Bottom,  // align the port on the main Shape
                    portId: "intentBottom",  // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,  // declare where links may connect at this port
                    fromLinkable: true, toLinkable: false,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                })
            ));

        this.palette.animationManager.duration = 100;
        this.palette.animationManager.isInitial = false;
        this.palette.animationManager.isEnabled = false;

        this.palette.model.nodeDataArray =  // initialize contents of Palette
            [
                // { modelid: 1, category: "Start", text: "Start" },
                { modelid: 2, text: "Entity RegExs", regExs: [], entity: null, isReadOnly: true, order: false, category: "Entity", },
                { modelid: 3, text: "Action", category: "Action", isReadOnly: true },
                { modelid: 4, text: "Response", isReadOnly: true, category: "Response", },
                // { modelid: 5, text: "Intent", loc: "150 0", category: "Intent",   },
                 { modelid: 6, text: "Condition",  isReadOnly: true, category: "Decision" }
                // { modelid: 7, category: "End", text: "End" }
                // { category: "Comment", text: "Comment" }
            ];
    }
    nodeStyle() {
        return [
            // The Node.location comes from the "loc" property of the node data,
            // converted by the Point.parse static method.
            // If the Node.location is changed, it updates the "loc" property of the node data,
            // converting back using the Point.stringify static method.
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
                // the Node.location is at the center of each node
                locationSpot: go.Spot.Center,
                // isShadowed: true,
                shadowColor: "#888",
                //  handle mouse enter/leave events to show/hide the ports
                mouseEnter: function(e, obj) {
                    // this.showPorts(obj.part, true);
                    const diagram = obj.part.diagram;
                    if (!diagram || diagram.isReadOnly || !diagram.allowLink) {
                        return;
                    }
                    obj.part.ports.each(function(port) {
                        port.stroke = (true ? "white" : null);
                    });
                },
                mouseLeave: function(e, obj) {
                    // this.showPorts(obj.part, true);
                    const diagram = obj.part.diagram;
                    if (!diagram || diagram.isReadOnly || !diagram.allowLink) {
                        return;
                    }
                    obj.part.ports.each(function(port) {
                        port.stroke = (false ? "white" : null);
                    });
                }
            }
        ];
    }

    isUnoccupied(r, node) {
        const diagram = node.diagram;

        // nested function used by Layer.findObjectsIn, below
        // only consider Parts, and ignore the given Node and any Links
        function navig(obj) {
            const part = obj.part;
            if (part === node) { return null; };
            if (part instanceof go.Link) { return null; };
            return part;
        }

        // only consider non-temporary Layers
        const lit = diagram.layers;
        while (lit.next()) {
            const lay = lit.value;
            if (lay.isTemporary) { continue; };
            if (lay.findObjectsIn(r, navig, null, true).count > 0) { return false; }
        }
        return true;
    }

    showPorts(node, show) {

        const diagram = node.diagram;
        if (!diagram || diagram.isReadOnly || !diagram.allowLink) {
            return;
        }
        node.ports.each(function(port) {
            port.stroke = (show ? "white" : null);
        });
    }

    ngOnInit() {
        this.diagram.div = this.diagramRef.nativeElement;
        this.palette.div = this.paletteRef.nativeElement;
    }
}
