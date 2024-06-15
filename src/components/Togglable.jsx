import { useState, forwardRef, useImperativeHandle } from 'react' // 5b. NOTE ALL THESE THREE!! "The function that creates the component is wrapped inside of a forwardRef function call. This way the component can access the ref that is assigned to it."
import PropTypes from 'prop-types' // 5b PropTypes section

const Togglable = forwardRef((props, refs) => { //5b. NOTE forwardRef!!
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(refs, () => {         // 5b. "The component uses the useImperativeHandle hook to make its toggleVisibility function available outside of the component."
    return {      
        toggleVisibility    
    }  
    })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})  // 5b! forwardRef

Togglable.propTypes = { // 5b
    buttonLabel: PropTypes.string.isRequired
}

export default Togglable