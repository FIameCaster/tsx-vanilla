import { element, fragment } from 'tsx-vanilla'

export function Counter({ start }: { start?: number }) {
  let count = start || 0
  return <>
    <h2>Counter</h2>
    <button 
      className="btn" 
      textContent={`count: ${count}`}
      onclick={function() {
        this.textContent = `count: ${++count}`
    }}/>
  </>
}
