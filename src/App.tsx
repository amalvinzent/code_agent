import { useCallback, useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import ReactMarkdown from 'react-markdown'
import './App.css'
import toast, { Toaster } from 'react-hot-toast'

interface Candidate {
  content: {
    parts: {
      text: string
    }[]
  }
}

interface Result {
  candidates: Candidate[]
}

function TypingEffectMarkdown({ content }: { content: string }) {
  if (!content) return
  const [text, setText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let index = 0
    const intervalId = setInterval(() => {
      setText((prev) => prev + content[index])
      index += 1

      if (index === content.length - 1) {
        clearInterval(intervalId)
      }
    }, 2)
    return () => clearInterval(intervalId)
  }, [content])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [text])

  return (
    <div
      ref={containerRef}
      className="scroll-smooth"
      style={{
        maxHeight: '100vh',
        overflow: 'auto'
      }}
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}

function App() {
  const [code, setCode] = useState('')
  const onChange = useCallback((val: string) => {
    setCode(val)
  }, [])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const callApi = async () => {
    setLoading(true)
    const guideline = `
    Please review the following code according to the aspects listed below. Provide a detailed response in **Markdown format**, with clear explanations and examples where applicable. 
    
    For each aspect, please:
    1. Use **Markdown headings** to separate each section.
    2. Use **bullet points** for explanations or observations.
    3. Provide **code snippets** in code blocks (triple backticks) for specific examples or suggested changes.
    
    Here are the review aspects:
    
    ### 1. **General Code Quality**
    - Is the code well-written, clear, and maintainable? Discuss the clarity of variable names, function definitions, and overall structure.
    - Provide examples where possible, such as unclear variable names or convoluted logic.
    
    ### 2. **Performance Optimization**
    - Are there any performance bottlenecks or inefficiencies? Identify areas where performance can be improved.
    - Suggest optimizations or more efficient algorithms where applicable.
    
    ### 3. **Security**
    - Are there any security vulnerabilities or risks, such as SQL injection, XSS, or improper data handling? 
    - Provide suggestions to mitigate any vulnerabilities.
    - Include code examples if any changes are needed to improve security.
    
    ### 4. **Error Handling**
    - Is error handling sufficient and robust? Does the code account for edge cases and unexpected inputs?
    - Provide suggestions for improving error handling (e.g., better logging, user feedback).
    - Include examples of missing or weak error handling.
    
    ### 5. **Code Duplication and Reusability**
    - Are there any duplicated code blocks or sections that could be refactored into reusable functions or modules?
    - Suggest any areas for refactoring to improve modularity and reduce repetition.
    - Provide code examples if applicable.
    
    ### 6. **Testing**
    - Does the code have sufficient unit or integration tests? How effective is the testing approach?
    - Are there areas of the code that lack tests? Suggest additional tests to cover edge cases.
    - If necessary, provide examples of test cases that could improve the test coverage.
    
    ### 7. **Scalability**
    - Can the code handle increased data volume or user load? Identify any potential scalability concerns.
    - Suggest improvements if the code might struggle to scale effectively.
    
    ### 8. **Documentation and Comments**
    - Is the code well-documented? Are functions, classes, and logic sections clearly explained?
    - Are the comments helpful and concise? Provide suggestions for improving documentation and comment clarity.
    
    ### 9. **Readability**
    - Is the code easy to read and understand for other developers? Consider the use of indentation, variable naming, and overall layout.
    - Suggest improvements for readability if needed, including better naming conventions or code organization.
    
    ### 10. **Refactoring**
    - Are there opportunities to improve the code structure or design for better maintainability, performance, or clarity?
    - Provide specific areas where refactoring could improve the code.
    
    ### 11. **Compliance with Coding Standards**
    - Does the code follow industry-standard coding conventions (e.g., variable naming, formatting, code organization)?
    - Identify any areas where the code diverges from common standards and suggest corrections.
    
    ### 12. **Modularity and Design**
    - Is the code properly modular? Are functions and classes well-separated, with each having a clear responsibility?
    - Suggest improvements for making the design cleaner and more maintainable.
    
    ### Please provide detailed feedback for each aspect, including code snippets for suggestions and improvements, where applicable.
    
    Here is the code to review:
    \`\`\`javascript
    ${code}
    \`\`\`
    `

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
          import.meta.env.VITE_API_KEY
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: guideline
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const markdownContent =
    result?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  return (
    <div className="container">
      <div className="left">
        <CodeMirror
          value={code}
          height="100vh"
          theme={'dark'}
          extensions={[javascript({ jsx: true })]}
          onChange={onChange}
          style={{ backgroundColor: '#57A6A1' }}
        />
        {code && !loading && (
          <button
            className="review_button"
            onClick={callApi}
            aria-label="Submit code for review"
          >
            Review code
          </button>
        )}
      </div>
      <div className="right">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <TypingEffectMarkdown content={markdownContent} />
        )}
      </div>
      <Toaster />
    </div>
  )
}

export default App
