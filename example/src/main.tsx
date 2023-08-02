import { element, fragment, ref, addSVGSupport } from 'tsx-vanilla'
import { Counter } from './counter'

// Static elements should probably be in HTML-files
// This example is just a demonstation of the different features

addSVGSupport()
document.getElementById('app')!.append(
	<h1>tsx-vanilla</h1>,
	<Counter />,
	<Counter start={2} />,
	<svg
    style={{ position: "absolute", zIndex: -1 }}
    attributes={{ width: 570, height: 510, viewBox: "0 0 19 17" }}
  >
		<path attributes={{
			d: "M 2 2L17 2L9.5 15Z",
			"stroke-width": 3,
			"stroke-linejoin": "round"
		}}/>
	</svg>
)