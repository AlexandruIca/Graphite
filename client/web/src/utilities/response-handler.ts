import { reactive } from "vue";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ResponseCallback = (responseData: Response) => void;
type ResponseMap = {
	[response: string]: ResponseCallback | undefined;
};

const state = reactive({
	responseMap: {} as ResponseMap,
});

export enum ResponseType {
	UpdateCanvas = "UpdateCanvas",
	ExportDocument = "ExportDocument",
	ExpandFolder = "ExpandFolder",
	CollapseFolder = "CollapseFolder",
	SetActiveTool = "SetActiveTool",
	SetActiveDocument = "SetActiveDocument",
	NewDocument = "NewDocument",
	CloseDocument = "CloseDocument",
	UpdateWorkingColors = "UpdateWorkingColors",
	PromptCloseConfirmationModal = "PromptCloseConfirmationModal",
	SetCanvasZoom = "SetCanvasZoom",
	SetRotation = "SetRotation",
}

export function registerResponseHandler(responseType: ResponseType, callback: ResponseCallback) {
	state.responseMap[responseType] = callback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleResponse(responseType: string, responseData: any) {
	const callback = state.responseMap[responseType];
	const data = parseResponse(responseType, responseData);

	if (callback && data) {
		callback(data);
	} else if (data) {
		console.error(`Received a Response of type "${responseType}" but no handler was registered for it from the client.`);
	} else {
		console.error(`Received a Response of type "${responseType}" but but was not able to parse the data.`);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResponse(responseType: string, data: any): Response {
	switch (responseType) {
		case "DocumentChanged":
			return newDocumentChanged(data.DocumentChanged);
		case "CollapseFolder":
			return newCollapseFolder(data.CollapseFolder);
		case "ExpandFolder":
			return newExpandFolder(data.ExpandFolder);
		case "SetActiveTool":
			return newSetActiveTool(data.SetActiveTool);
		case "SetActiveDocument":
			return newSetActiveDocument(data.SetActiveDocument);
		case "NewDocument":
			return newNewDocument(data.NewDocument);
		case "CloseDocument":
			return newCloseDocument(data.CloseDocument);
		case "UpdateCanvas":
			return newUpdateCanvas(data.UpdateCanvas);
		case "SetCanvasZoom":
			return newSetZoom(data.SetCanvasZoom);
		case "SetRotation":
			return newSetRotation(data.SetRotation);
		case "ExportDocument":
			return newExportDocument(data.ExportDocument);
		case "UpdateWorkingColors":
			return newUpdateWorkingColors(data.UpdateWorkingColors);
		case "PromptCloseConfirmationModal":
			return {};
		default:
			throw new Error(`Unrecognized origin/responseType pair: ${origin}, '${responseType}'`);
	}
}

export type Response = SetActiveTool | UpdateCanvas | DocumentChanged | CollapseFolder | ExpandFolder | UpdateWorkingColors | SetCanvasZoom | SetRotation;

export interface CloseDocument {
	document_index: number;
}
function newCloseDocument(input: any): CloseDocument {
	return { document_index: input.document_index };
}

export interface Color {
	red: number;
	green: number;
	blue: number;
	alpha: number;
}
function newColor(input: any): Color {
	// TODO: Possibly change this in the Rust side to avoid any pitfalls
	return { red: input.red * 255, green: input.green * 255, blue: input.blue * 255, alpha: input.alpha };
}

export interface UpdateWorkingColors {
	primary: Color;
	secondary: Color;
}
function newUpdateWorkingColors(input: any): UpdateWorkingColors {
	return {
		primary: newColor(input.primary),
		secondary: newColor(input.secondary),
	};
}

export interface SetActiveTool {
	tool_name: string;
}
function newSetActiveTool(input: any): SetActiveTool {
	return {
		tool_name: input.tool_name,
	};
}

export interface SetActiveDocument {
	document_index: number;
}
function newSetActiveDocument(input: any): SetActiveDocument {
	return {
		document_index: input.document_index,
	};
}

export interface NewDocument {
	document_name: string;
}
function newNewDocument(input: any): NewDocument {
	return {
		document_name: input.document_name,
	};
}

export interface UpdateCanvas {
	document: string;
}
function newUpdateCanvas(input: any): UpdateCanvas {
	return {
		document: input.document,
	};
}

export interface ExportDocument {
	document: string;
}
function newExportDocument(input: any): UpdateCanvas {
	return {
		document: input.document,
	};
}

export type DocumentChanged = {};
function newDocumentChanged(_: any): DocumentChanged {
	return {};
}

export interface CollapseFolder {
	path: BigUint64Array;
}
function newCollapseFolder(input: any): CollapseFolder {
	return {
		path: new BigUint64Array(input.path.map((n: number) => BigInt(n))),
	};
}

export interface ExpandFolder {
	path: BigUint64Array;
	children: Array<LayerPanelEntry>;
}
function newExpandFolder(input: any): ExpandFolder {
	return {
		path: new BigUint64Array(input.path.map((n: number) => BigInt(n))),
		children: input.children.map((child: any) => newLayerPanelEntry(child)),
	};
}

export interface SetCanvasZoom {
	new_zoom: number;
}
function newSetZoom(input: any): SetCanvasZoom {
	return {
		new_zoom: input.new_zoom,
	};
}

export interface SetRotation {
	new_radians: number;
}
function newSetRotation(input: any): SetRotation {
	return {
		new_radians: input.new_radians,
	};
}

export interface LayerPanelEntry {
	name: string;
	visible: boolean;
	layer_type: LayerType;
	path: BigUint64Array;
	layer_data: LayerData;
}
function newLayerPanelEntry(input: any): LayerPanelEntry {
	return {
		name: input.name,
		visible: input.visible,
		layer_type: newLayerType(input.layer_type),
		layer_data: newLayerData(input.layer_data),
		path: new BigUint64Array(input.path.map((n: number) => BigInt(n))),
	};
}

export interface LayerData {
	expanded: boolean;
	selected: boolean;
}
function newLayerData(input: any): LayerData {
	return {
		expanded: input.expanded,
		selected: input.selected,
	};
}

export enum LayerType {
	Folder = "Folder",
	Shape = "Shape",
	Circle = "Circle",
	Rect = "Rect",
	Line = "Line",
	PolyLine = "PolyLine",
	Ellipse = "Ellipse",
}
function newLayerType(input: any): LayerType {
	switch (input) {
		case "Folder":
			return LayerType.Folder;
		case "Shape":
			return LayerType.Shape;
		case "Circle":
			return LayerType.Circle;
		case "Rect":
			return LayerType.Rect;
		case "Line":
			return LayerType.Line;
		case "PolyLine":
			return LayerType.PolyLine;
		case "Ellipse":
			return LayerType.Ellipse;
		default:
			throw Error(`Received invalid input as an enum variant for LayerType: ${input}`);
	}
}