import { computed } from '@tldraw/state'
import { VecModel } from '@tldraw/tlschema'
import { assertExists, deepCopy } from '@tldraw/utils'
import { Mat } from '../../../primitives/Mat'
import { Vec } from '../../../primitives/Vec'
import { uniqueId } from '../../../utils/uniqueId'
import { Editor } from '../../Editor'
import { SnapData, SnapManager } from './SnapManager'

export class HandleSnaps {
	readonly editor: Editor
	constructor(readonly manager: SnapManager) {
		this.editor = manager.editor
	}

	snapHandle({
		handlePoint,
		additionalSegments,
	}: {
		handlePoint: Vec
		additionalSegments: Vec[][]
	}): SnapData | null {
		const snapThreshold = this.manager.getSnapThreshold()

		// Find the nearest point that is within the snap threshold
		let minDistance = snapThreshold
		let nearestPoint: Vec | null = null

		for (const shapeId of this.manager.getSnappableShapes()) {
			const handleSnapGeometry = this.manager.getShapeSnapInfo(shapeId)?.handleSnapGeometry
			if (!handleSnapGeometry) continue

			const nearestOnShape = handleSnapGeometry.nearestPoint(handlePoint)
			const distance = Vec.Dist(handlePoint, nearestOnShape)

			if (isNaN(distance)) continue
			if (distance < minDistance) {
				minDistance = distance
				nearestPoint = nearestOnShape
			}
		}

		// If we found a point, display snap lines, and return the nudge
		if (nearestPoint) {
			this.manager.setIndicators([
				{
					id: uniqueId(),
					type: 'points',
					points: [nearestPoint],
				},
			])

			return { nudge: Vec.Sub(nearestPoint, handlePoint) }
		}

		return null
	}
}
