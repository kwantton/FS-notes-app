import Note from "./components/Note.jsx"
import { useState, useEffect } from 'react'
import noteService from './services/notes' // imports THREE functions as defaultc: 
import Notification from './components/Notification.jsx'
import Footer from './components/Footer.jsx'

const App = () => {
  const [notes, setNotes] = useState(null) // HUOM! Tämä takia, huomaa rivin ~~19 "if(!notes) {return null}" joka varmistaa, että App:in käynnistäessä ekalla kertaa palautetaan null, ja vasta kun notes on haettu serveriltä (?), alkaa toimimaan; palautetaan null App:ista, kunnes serveriltä on saatu data. HUOM! "The method based on conditional rendering is suitable in cases where it is impossible to define the state so that the initial rendering is possible." Eli mitään oikeaa syytä initata notes "null":iksi ei ole; paljon mieluummin inittaa []:ksi, jolloin tätä ongelmaa ei ole!! (ongelma: null:ille ei voi kutsua .map:iä. TAI, joutuisit joka kohdassa tarkistamaan ?.map jne... paskempi vaihtoehto)
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(false) // tähän true -> kaikki näytetään by default; false -> näytetään vain tärkeät by default c:
  const [errorMessage, setErrorMessage] = useState('')
  
  useEffect(() => {    
    noteService.getAll()
    .then(initialNotes => {
      setNotes(initialNotes)
    }) 
  }, []) // without the [] as 2nd argument, it would keep rendering them FOREVER! Thanks to the [], it will only render them ONCE c:
  if(!notes) { 
    return null
  }
  console.log('render', notes.length, 'notes')

  const addNote = (event) => {
    event.preventDefault()   // prevents the page from being refreshed on submit event 
    console.log('form onSubmit button clicked', event.currentTarget)  // event.target works too: "event.target will return the element that was clicked but not necessarily the element to which the event listener has been attached."
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5
      // id : notes.length+1 // "it's better to let the server generate the new id"
    }

    noteService      
    .create(noteObject)      
    .then(note => {        
      setNotes(notes.concat(note))
      setNewNote('')
    })
  }

  const handleNoteChange = (event) => {     // this event handler is called EVERY TIME onChange of the form value (=form field!). See console.logs! This is needed to be able to change the input value of the form; otherwise it's stuck forever as "a new note" and the console will show a React error message complaining about this c:
    console.log(event.currentTarget.value)
    setNewNote(event.currentTarget.value)   // this updates the newNote based on what the value of the form input field is
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

  const notesToShow = showAll ? // ELI: jos showAll = True, niin näytä notes. Jos ei, näytä vain tärkeät (ehto ? tosi:epätosi). Tätä notesToShow:ta käytetään alla returnissa!
  notes : notes.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
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
      <form onSubmit={addNote}>        
        <input value={newNote} onChange={handleNoteChange}/>        
        <button type="submit">save</button>
      </form>
      <Footer/>
    </div>
  )
}

export default App
//