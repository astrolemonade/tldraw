import { assertExists } from '@tldraw/utils'
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

			const shapePageTransform = assertExists(this.editor.getShapePageTransform(shapeId))
			const pointInShapeSpace = this.editor.getPointInShapeSpace(shapeId, handlePoint)
			const nearestShapePointInShapeSpace = handleSnapGeometry.nearestPoint(pointInShapeSpace)
			const nearestInPageSpace = shapePageTransform.applyToPoint(nearestShapePointInShapeSpace)
			const distance = Vec.Dist(handlePoint, nearestInPageSpace)

			if (isNaN(distance)) continue
			if (distance < minDistance) {
				minDistance = distance
				nearestPoint = nearestInPageSpace
			}
		}

		// handle additional segments:
		for (const segment of additionalSegments) {
			const nearestOnSegment = Vec.NearestPointOnLineSegment(segment[0], segment[1], handlePoint)
			const distance = Vec.Dist(handlePoint, nearestOnSegment)

			if (distance < minDistance) {
				minDistance = distance
				nearestPoint = nearestOnSegment
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
