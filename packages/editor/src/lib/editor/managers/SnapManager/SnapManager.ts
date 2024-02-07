import { EMPTY_ARRAY, atom, computed } from '@tldraw/state'
import {
	TLFrameShape,
	TLGroupShape,
	TLParentId,
	TLShape,
	TLShapeId,
	isShapeId,
} from '@tldraw/tlschema'
import { Vec, VecLike } from '../../../primitives/Vec'
import type { Editor } from '../../Editor'
import { ShapeSnapInfo } from '../../shapes/ShapeUtil'
import { BoundsSnaps } from './BoundsSnaps'
import { HandleSnaps } from './HandleSnaps'

/** @public */
export type PointsSnapIndicator = {
	id: string
	type: 'points'
	points: VecLike[]
}

/** @public */
export type GapsSnapIndicator = {
	id: string
	type: 'gaps'
	direction: 'horizontal' | 'vertical'
	gaps: Array<{
		startEdge: [VecLike, VecLike]
		endEdge: [VecLike, VecLike]
	}>
}

/** @public */
export type SnapIndicator = PointsSnapIndicator | GapsSnapIndicator

/** @public */
export interface SnapData {
	nudge: Vec
}

/** @public */
export class SnapManager {
	readonly shapeBounds: BoundsSnaps
	readonly handles: HandleSnaps

	private _snapIndicators = atom<SnapIndicator[] | undefined>('snapLines', undefined)

	constructor(public readonly editor: Editor) {
		this.shapeBounds = new BoundsSnaps(this)
		this.handles = new HandleSnaps(this)
	}

	getIndicators() {
		return this._snapIndicators.get() ?? (EMPTY_ARRAY as SnapIndicator[])
	}

	clearIndicators() {
		if (this.getIndicators().length) {
			this._snapIndicators.set(undefined)
		}
	}

	setIndicators(indicators: SnapIndicator[]) {
		this._snapIndicators.set(indicators)
	}

	@computed getSnapThreshold() {
		return 8 / this.editor.getZoomLevel()
	}

	// TODO: make this an incremental derivation
	@computed getSnappableShapes(): Set<TLShapeId> {
		const { editor } = this
		const renderingBounds = editor.getRenderingBounds()
		const selectedShapeIds = editor.getSelectedShapeIds()

		const snappableShapes: Set<TLShapeId> = new Set()

		const collectSnappableShapesFromParent = (parentId: TLParentId) => {
			if (isShapeId(parentId)) {
				const parent = editor.getShape(parentId)
				if (parent && editor.isShapeOfType<TLFrameShape>(parent, 'frame')) {
					snappableShapes.add(parentId)
				}
			}
			const sortedChildIds = editor.getSortedChildIdsForParent(parentId)
			for (const childId of sortedChildIds) {
				// Skip any selected ids
				if (selectedShapeIds.includes(childId)) continue
				const childShape = editor.getShape(childId)
				if (!childShape) continue
				const util = editor.getShapeUtil(childShape)
				// Skip any shapes that don't allow snapping
				if (!util.canSnap(childShape)) continue
				// Only consider shapes if they're inside of the viewport page bounds
				const pageBounds = editor.getShapePageBounds(childId)
				if (!(pageBounds && renderingBounds.includes(pageBounds))) continue
				// Snap to children of groups but not group itself
				if (editor.isShapeOfType<TLGroupShape>(childShape, 'group')) {
					collectSnappableShapesFromParent(childId)
					continue
				}
				snappableShapes.add(childId)
			}
		}

		collectSnappableShapesFromParent(this.getCurrentCommonAncestor() ?? editor.getCurrentPageId())

		return snappableShapes
	}

	// This needs to be external from any expensive work
	@computed getCurrentCommonAncestor() {
		return this.editor.findCommonAncestor(this.editor.getSelectedShapes())
	}

	@computed private shapeSnapInfoCache() {
		return this.editor.store.createComputedCache<Required<ShapeSnapInfo>, TLShape>(
			'snapInfo',
			(shape) => {
				const util = this.editor.getShapeUtil(shape)
				const snapInfo = util.getSnapInfo(shape)

				const boundsSnapPoints =
					snapInfo.boundsSnapPoints ?? getDefaultBoundsSnapPoints(this.editor, shape)

				const handleSnapGeometry =
					snapInfo.handleSnapGeometry !== undefined
						? snapInfo.handleSnapGeometry
						: this.editor.getShapeGeometry(shape)

				return { boundsSnapPoints, handleSnapGeometry }
			}
		)
	}

	getShapeSnapInfo(shapeId: TLShapeId) {
		return this.shapeSnapInfoCache().get(shapeId)
	}
}

function getDefaultBoundsSnapPoints(editor: Editor, shape: TLShape) {
	const bounds = editor.getShapeGeometry(shape).bounds
	return [...bounds.corners, bounds.center]
}
