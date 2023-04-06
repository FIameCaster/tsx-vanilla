import { element, fragment, ref } from 'tsx-vanilla'
import { Counter } from './counter'

// Static elements should be in HTML-files
// This example is a demonstation of the different features, not of how it should be used

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