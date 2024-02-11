import { useEditor, useValue } from '@tldraw/editor'
import { useAllowGroup, useAllowUngroup, useThreeStackableItems } from '../../../hooks/menuHelpers'
import { useActions } from '../../../hooks/useActions'
import { useBreakpoint } from '../../../hooks/useBreakpoint'
import { useHasLinkShapeSelected } from '../../../hooks/useHasLinkShapeSelected'
import { useUnlockedSelectedShapesCount } from '../../../hooks/useUnlockedSelectedShapesCount'
import { TldrawUiMenuItem } from '../TldrawUiMenuItem'

/** @public */
export function DefaultActionsMenu() {
	return (
		<>
			<AlignMenuItems />
			<DistributeMenuItems />
			<StackMenuItems />
			<ReorderMenuItems />
			<ZoomOrRotateMenuItem />
			<RotateCWMenuItem />
			<EditLinkMenuItem />
			<GroupOrUngroupMenuItem />
		</>
	)
}

function AlignMenuItems() {
	const actions = useActions()
	const twoSelected = useUnlockedSelectedShapesCount(2)

	return (
		<>
			<TldrawUiMenuItem {...actions['align-left']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['align-center-horizontal']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['align-right']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['stretch-horizontal']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['align-top']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['align-center-vertical']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['align-bottom']} disabled={!twoSelected} />
			<TldrawUiMenuItem {...actions['stretch-vertical']} disabled={!twoSelected} />
		</>
	)
}

function DistributeMenuItems() {
	const actions = useActions()
	const threeSelected = useUnlockedSelectedShapesCount(3)

	return (
		<>
			<TldrawUiMenuItem {...actions['distribute-horizontal']} disabled={!threeSelected} />
			<TldrawUiMenuItem {...actions['distribute-vertical']} disabled={!threeSelected} />
		</>
	)
}

function StackMenuItems() {
	const actions = useActions()
	const threeStackableItems = useThreeStackableItems()

	return (
		<>
			<TldrawUiMenuItem {...actions['stack-horizontal']} disabled={!threeStackableItems} />
			<TldrawUiMenuItem {...actions['stack-vertical']} disabled={!threeStackableItems} />
		</>
	)
}

function ReorderMenuItems() {
	const actions = useActions()
	const oneSelected = useUnlockedSelectedShapesCount(1)

	return (
		<>
			<TldrawUiMenuItem {...actions['send-to-back']} disabled={!oneSelected} />
			<TldrawUiMenuItem {...actions['send-backward']} disabled={!oneSelected} />
			<TldrawUiMenuItem {...actions['bring-forward']} disabled={!oneSelected} />
			<TldrawUiMenuItem {...actions['bring-to-front']} disabled={!oneSelected} />
		</>
	)
}

function ZoomOrRotateMenuItem() {
	const breakpoint = useBreakpoint()
	return breakpoint < 5 ? <ZoomTo100MenuItem /> : <RotateCCWMenuItem />
}

function ZoomTo100MenuItem() {
	const actions = useActions()
	const editor = useEditor()
	const isZoomedTo100 = useValue('zoom is 1', () => editor.getZoomLevel() === 1, [editor])

	return <TldrawUiMenuItem {...actions['zoom-to-100']} disabled={isZoomedTo100} />
}

function RotateCCWMenuItem() {
	const actions = useActions()
	const oneSelected = useUnlockedSelectedShapesCount(1)

	return <TldrawUiMenuItem {...actions['rotate-ccw']} disabled={!oneSelected} />
}

function RotateCWMenuItem() {
	const actions = useActions()
	const oneSelected = useUnlockedSelectedShapesCount(1)

	return <TldrawUiMenuItem {...actions['rotate-cw']} disabled={!oneSelected} />
}

function EditLinkMenuItem() {
	const actions = useActions()
	const showEditLink = useHasLinkShapeSelected()

	return <TldrawUiMenuItem {...actions['edit-link']} disabled={!showEditLink} />
}

function GroupOrUngroupMenuItem() {
	const allowGroup = useAllowGroup()
	const allowUngroup = useAllowUngroup()
	return allowGroup ? <GroupMenuItem /> : allowUngroup ? <UngroupMenuItem /> : <GroupMenuItem />
}

function GroupMenuItem() {
	const actions = useActions()
	const twoSelected = useUnlockedSelectedShapesCount(2)

	return <TldrawUiMenuItem {...actions['group']} disabled={!twoSelected} />
}

function UngroupMenuItem() {
	const actions = useActions()
	return <TldrawUiMenuItem {...actions['group']} />
}
