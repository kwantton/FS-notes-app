import Note from "./components/Note.jsx"
import { useState, useEffect } from 'react'
import noteService from './services/notes' // imports THREE functions as defaultc: 
import loginService from './services/login' // part 5a
import Notification from './components/Notification.jsx'
import Footer from './components/Footer.jsx'
import LoginForm from "./components/LoginForm.jsx" // 5b
import Togglable from "./components/Togglable.jsx" // 5b; extracting the visibility logic of the login form into "Togglable"
import NoteForm from "./components/NoteForm.jsx"

const App = () => {
  const [notes, setNotes] = useState(null) // HUOM! Tämä takia, huomaa rivin ~~19 "if(!notes) {return null}" joka varmistaa, että App:in käynnistäessä ekalla kertaa palautetaan null, ja vasta kun notes on haettu serveriltä (?), alkaa toimimaan; palautetaan null App:ista, kunnes serveriltä on saatu data. HUOM! "The method based on conditional rendering is suitable in cases where it is impossible to define the state so that the initial rendering is possible." Eli mitään oikeaa syytä initata notes "null":iksi ei ole; paljon mieluummin inittaa []:ksi, jolloin tätä ongelmaa ei ole!! (ongelma: null:ille ei voi kutsua .map:iä. TAI, joutuisit joka kohdassa tarkistamaan ?.map jne... paskempi vaihtoehto)
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(false) // tähän true -> kaikki näytetään by default; false -> näytetään vain tärkeät by default c:
  const [errorMessage, setErrorMessage] = useState(null) // you must have null here instead of '', or else you'll see the red error box with '' (nothing) in it by default c:
  const [username, setUsername] = useState('') // 5a https://fullstackopen.com/en/part4/token_authentication#limiting-creating-new-notes-to-logged-in-users  
  const [password, setPassword] = useState('') // 5a
  const [user, setUser] = useState(null) // 5a
  const [loginVisible, setLoginVisible] = useState(false) // 5b
   
  useEffect(() => {    
    noteService.getAll()
    .then(initialNotes => {
      setNotes(initialNotes)
    }) 
  }, []) // without the [] as 2nd argument, it would keep rendering them FOREVER! Thanks to the [], it will only render them ONCE c:

  useEffect(() => {    // 5a. NB!! This has to be BEFORE the "if(!notes)..." below! Why? Dunno!
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')    
    if (loggedUserJSON) {      
      const user = JSON.parse(loggedUserJSON)      
      setUser(user)      
      noteService.setToken(user.token)    
    }  
  }, []) // remember: "The empty array as the parameter of the effect ensures that the effect is executed only when the component is rendered for the first time."
  
  if(!notes) { 
    return null
  }
  console.log('render', notes.length, 'notes')


  // 5b -> "Togglable.jsx" component used as well

  const loginForm = () => { // 5b
    const hideWhenVisible = { display: loginVisible ? 'none' : '' } // none = do NOT show
    const showWhenVisible = { display: loginVisible ? '' : 'none' } // '' = "display will not receive any value related to the visibility of the component", eli ei piilota (eikä tee mitään muutakaan)

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>     {/**  shows login*/}
        </div>
        <div style={showWhenVisible}>
          <LoginForm  // 5b - note: the props are listed here below normally c:
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>    {/** hides login */}
        </div>
      </div>
    )
  }

  // 5b "NoteForm" component used as well
  const noteForm = () => (
    <Togglable buttonLabel='new note'>
      <NoteForm createNote={addNote} />
    </Togglable> /** since NoteForm is the child component of Togglable, this closing tag is needed! */
  )

  
  const addNote = (noteObject) => {
    //console.log('form onSubmit button clicked', event.currentTarget)  // event.target works too: "event.target will return the element that was clicked but not necessarily the element to which the event listener has been attached."
    noteService      
    .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        // setNewNote('') // NOT ANYMORE! this was moved to "NoteForm" component c:
    })
  }

  /*const handleNoteChange = (event) => {     // this event handler is called EVERY TIME onChange of the form value (=form field!). See console.logs! This is needed to be able to change the input value of the form; otherwise it's stuck forever as "a new note" and the console will show a React error message complaining about this c:
    console.log(event.currentTarget.value)
    setNewNote(event.currentTarget.value)   // this updates the newNote based on what the value of the form input field is
  }*/ // NOT ANYMORE! MOVED TO NoteForm component c:

  const handleLogin = async (event) => {    
    event.preventDefault()        
    try {      
      const user = await loginService.login({       // remember the await! Even if you have async/await there already, you also need it here.  
        username, password
      })    
      
      window.localStorage.setItem(       // 5a: so that even if browser is refreshed, the loggedNoteappUser stays in the local storage of the browser
        'loggedNoteappUser', JSON.stringify(user)      
      )
      noteService.setToken(user.token) // so, user has property token, which will contain the token. This noteService.setToken will set the token for the noteService.create's post function to use -> in effect, authentication ok
      setUser(user)    // "The token returned with a successful login is saved to the application's state - the user's field token:"  
      setUsername('')     
      setPassword('')    
    } catch (exception) {      
      setErrorMessage('Please choose one or more: (a) learn to type, (b) jog your memory, (c) create a new account, (d) jog')      
      setTimeout(() => {        
        setErrorMessage(null)  // = show the error message for 5 seconds, then set the error message to null again    
      }, 5000)    
    }
  }

  const toggleImportanceOf = id => {
    const url = `http://localhost:3001/api/notes/${id}` // the url for each note is unique; this is RESTful stuff c:
    const note = notes.find(n => n.id === id) // find returns the first value that has a truthy return. The ids should be unique, so this works
    const changedNote = { ...note, important: !note.important } // only change the value of "important"; if it's true, to false, and vice versa
  
    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote)) // if note id is not the id of the changed note, set the note as-is. If the id is that of the changed note, set the changed note as the response.data from the specified note url (each url, according to REST, lives in its own url)
      })
      .catch(error => {      // jos yritetään muuttaa importance:a notelle joka on jo poistettu (tai ei muuten vaan ole olemassa), niin handlataan tilanne näin. HUOM! Mitään poistotoimintoa ei vielä ole toteutettu (osio 2d fullstack-kurssin materiaalista)
        setErrorMessage(          
          `Note '${note.content}' was already removed from server`        
        )        
        setTimeout(() => {          
          setErrorMessage(null)        
        }, 5000)     
        setNotes(notes.filter(n => n.id !== id))    
      })
    }

  const notesToShow = showAll  // ELI: jos showAll = True, niin näytä notes. Jos ei, näytä vain tärkeät (ehto ? tosi:epätosi). Tätä notesToShow:ta käytetään alla returnissa!
    ? notes 
    : notes.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {user === null 
        ? loginForm() 
        : <div>
            <p>{user.name} logged-in</p>
            {/**{noteForm()} <- this is old! this was before in 5b we started using NoteForm as a child component of Togglable*/}
            {noteForm()}  
          </div>}      {/** in effect: only if user is logged in (=is not null), show the html of loginForm. Otherwise, show the user's name as logged in, and the notes. Nice. */} 
      <div>        
        <button onClick={() => setShowAll(!showAll)}>          
          show {showAll ? 'important' : 'all' } {/** tämä on teksti joka näkyy näppäimessä c: ELI muuttuu sen mukaan, mitä näytetään onClick c: */}        
        </button>      
      </div>
      <ul>
      {notesToShow.map(note =>
         
          <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)}/>
        )}
      </ul>
      <Footer/>
    </div>
  )
}

export default App