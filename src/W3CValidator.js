import React, { useEffect, useMemo, useRef, useState } from 'react';

const baseButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
};

const containerStyle = {
  background: '#fff',
  border: '1px solid #333',
  bottom: '1em',
  display: 'flex',
  flexDirection: 'column',
  fontSize: '13px',
  padding: '.5em',
  position: 'fixed',
  right: '1em',
  zIndex: 100000,
};

const validationResultStyle = {
  borderBottom: '1px solid #ccc',
  margin: '.5em 0 0',
  maxHeight: '90vh',
  overflowY: 'auto',
  paddingBottom: '.5em',
};

const filtersStyle = {
  borderBottom: '1px solid #ccc',
  margin: '0 .5em',
  paddingBottom: '.5em',
};

const secondaryButtonStyle = {
  ...baseButtonStyle,
  background: '#fff',
  color: 'rgb(23, 83, 140)',
};
const mainButtonStyle = {
  ...baseButtonStyle,
  background: 'rgb(19, 98, 174)',
  color: '#fff',
  margin: '0 .5em',
};
const baseMessageTypeStyle = {
  borderRadius: '2px',
  marginRight: '.5em',
  minWidth: '5em',
  padding: '.1em .5em',
};

const messageTypeStyles = {
  error: {
    ...baseMessageTypeStyle,
    background: '#f00',
    color: '#fff',
  },
  warning: {
    ...baseMessageTypeStyle,
    background: 'rgb(156 119 70)',
    color: '#fff',
  },
  info: {
    ...baseMessageTypeStyle,
    background: '#ff6',
  },
};

const detailsStyle = {
  border: '1px solid #ccc',
  margin: '.5em',
  padding: '.5em',
};

const messageToggleStyle = {
  ...baseButtonStyle,
  background: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
};
const inContextStyle = {
  background: '#e3f5ea',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '300px',
  maxWidth: '90vh',
  overflowY: 'auto',
};

const highlightText = (text, start, length, highlightRef) => (
  <>
    {console.log(start, length, text.length)}
    <span>{text.substr(0, start)}</span>
    <span style={{ color: 'green', fontWeight: 700, textDecoration: 'underline' }} ref={highlightRef}>
      {text.substr(start, length)}
    </span>
    <span>{text.substr(start + length)}</span>
  </>
);
const InContext = ({ message, validatedHtml }) => {
  const { firstColumn, lastColumn, lastLine, hiliteLength } = message;
  const highlightRef = useRef();

  const lines = useMemo(
    () =>
      validatedHtml.split('\n').map((line, index) => (
        <pre key={index} style={{ margin: 0, padding: 0 }}>
          {lastLine === index + 1
            ? highlightText(
              line,
              firstColumn ? firstColumn - 1 : lastColumn - hiliteLength,
              hiliteLength,
              highlightRef,
            )
            : line}
        </pre>
      )),
    [message, validatedHtml],
  );
  useEffect(() => {
    if (!highlightRef.current) {
      return;
    }
    highlightRef.current.scrollIntoView();
  }, [highlightRef]);

  return <div style={inContextStyle}>{lines}</div>;
};

const ValidationMessage = ({ message, validatedHtml }) => {
  const [showInContext, setShowInContext] = useState(false);

  return (
    <div>
      <div>
        {highlightText(
          message.extract,
          message.hiliteStart,
          message.hiliteLength,
        )}
        <button
          style={secondaryButtonStyle}
          onClick={() => setShowInContext(!showInContext)}
        >
          Show in context
        </button>
      </div>
      {showInContext && (
        <InContext message={message} validatedHtml={validatedHtml} />
      )}
    </div>
  );
};

const ValidationMessageGroup = ({
                                  messageGroup,
                                  setFilterState,
                                  validatedHtml,
                                }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      <button
        style={messageToggleStyle}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span style={messageTypeStyles[messageGroup.theType]}>
          {messageGroup.theType}
        </span>{' '}
        {messageGroup.message}
      </button>
      {showDetails && (
        <div style={detailsStyle}>
          <button
            style={mainButtonStyle}
            onClick={() =>
              setFilterState(prevState => ({
                ...prevState,
                types: prevState.types.concat(messageGroup.theType),
              }))
            }
          >
            Hide {messageGroup.theType}
          </button>
          <button
            style={mainButtonStyle}
            onClick={() =>
              setFilterState(prevState => ({
                ...prevState,
                messages: prevState.messages.concat(messageGroup.message),
              }))
            }
          >
            Hide message
          </button>
          {messageGroup.filteredMessages.map(message => (
            <ValidationMessage
              validatedHtml={validatedHtml}
              message={message}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ValidationResult = ({
                            setFilterState,
                            validationResult,
                            validatedHtml,
                          }) => {
  const filteredMessageGroups = Object.values(validationResult)
    .filter(messageGroup => messageGroup.filteredMessages.length)
    .map(messageGroup => (
      <ValidationMessageGroup
        key={messageGroup.theType + messageGroup.message}
        messageGroup={messageGroup}
        setFilterState={setFilterState}
        validatedHtml={validatedHtml}
      />
    ));

  return (
    <div style={validationResultStyle}>
      {filteredMessageGroups.length ? filteredMessageGroups : 'No (unfiltered) messages'}
    </div>
  );
};

const Filters = ({ filterState, setFilterState }) => (
  <div style={filtersStyle}>
    {!!filterState.types.length && (
      <div>
        <div>Type filters</div>
        {filterState.types.map(type => (
          <div key={type}>
            <button
              style={secondaryButtonStyle}
              onClick={() =>
                setFilterState(prevState => ({
                  ...prevState,
                  types: prevState.types.filter(pType => pType !== type),
                }))
              }
            >
              {type}
            </button>
          </div>
        ))}
      </div>
    )}
    {!!filterState.messages.length && (
      <div>
        <div>Message filters</div>
        {filterState.messages.map(type => (
          <div key={type}>
            <button
              style={secondaryButtonStyle}
              onClick={() =>
                setFilterState(prevState => ({
                  ...prevState,
                  messages: prevState.messages.filter(pType => pType !== type),
                }))
              }
            >
              {type}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const initialFilterState = { messages: [], types: [] };
const getStoredFilterState = () => {
  const filterState = localStorage.getItem('w3cvalidator-filterstate');
  if (!filterState) {
    return initialFilterState;
  }

  try {
    return JSON.parse(filterState);
  } catch (err) {
    return initialFilterState;
  }
};

const W3CValidator = ({
                        containerClassName,
                        validatorUrl = 'https://validator.w3.org/nu/',
                      }) => {
  const [validatedHtml, setValidatedHtml] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [filterState, setFilterState] = useState(getStoredFilterState());
  const [showFilters, setShowFilters] = useState(false);
  const [showResult, setShowResult] = useState(true);

  useEffect(
    () =>
      localStorage.setItem(
        'w3cvalidator-filterstate',
        JSON.stringify(filterState),
      ),
    [filterState],
  );

  const doValidate = () => {
    const html =
      new XMLSerializer().serializeToString(document.doctype) +
      '\n' +
      document.querySelector('html').outerHTML;
    setIsValidating(true);
    setValidatedHtml(html);
    setValidationResult(null);
    fetch(`${validatorUrl}?out=json`, {
      method: 'POST',
      headers: {
        'content-type': 'text/html; charset=UTF-8',
      },
      body: html,
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.status + res.statusMessage);
        }

        return res.json();
      })
      .then(parsedRes => {
        const mappedResponse = parsedRes.messages
          .map(message => ({
            ...message,
            theType: message.subType || message.type,
          }))
          .reduce((grouped, message) => {
            const messageGroup = (grouped[
            message.theType + message.message
              ] = grouped[message.theType + message.message] || {
              theType: message.theType,
              message: message.message,
              messages: [],
            });
            messageGroup.messages = messageGroup.messages.concat(message);
            return grouped;
          }, {});

        setValidationResult(mappedResponse);
        setIsValidating(false);
        setShowResult(true);
      })
      .catch(err => {
        console.error(err);
        setIsValidating(false);
      });
  };

  const filteredResult =
    validationResult &&
    Object.entries(validationResult).reduce((grouped, [key, messageGroup]) => {
      grouped[key] = { ...messageGroup };
      grouped[key].filteredMessages = messageGroup.messages.filter(
        message =>
          !filterState.messages.includes(message.message) &&
          !filterState.types.includes(message.theType),
      );
      grouped[key].numFiltered =
        messageGroup.messages.length - grouped[key].filteredMessages.length;
      return grouped;
    }, {});

  const numFilteredMessages =
    filteredResult &&
    Object.values(filteredResult).reduce(
      (total, messageGroup) => total + messageGroup.numFiltered,
      0,
    );
  const filteredMessagesLabel = numFilteredMessages ? `(${numFilteredMessages} messages hidden)` : '';

  return (
    <div style={containerStyle} className={containerClassName}>
      {showResult && filteredResult && (
        <ValidationResult
          filterState={filterState}
          setFilterState={setFilterState}
          validationResult={filteredResult}
          validatedHtml={validatedHtml}
        />
      )}
      {showResult && showFilters && (
        <Filters filterState={filterState} setFilterState={setFilterState} />
      )}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '0 .5em',
          padding: '.5em 0',
        }}
      >
        {validationResult && showResult && (
          <>
            <button
              style={secondaryButtonStyle}
              onClick={() => {
                setShowFilters(false);
                setValidationResult(null);
              }}
            >
              Clear
            </button>
            <button
              style={secondaryButtonStyle}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? `Hide active filters ${filteredMessagesLabel}` : `Show active filters ${filteredMessagesLabel}`}
            </button>
          </>
        )}
        {validationResult && (
          <button
            style={secondaryButtonStyle}
            onClick={() => setShowResult(!showResult)}
          >
            {showResult ? 'Hide results' : 'Show results'}
          </button>
        )}
        <button
          disabled={isValidating}
          style={mainButtonStyle}
          onClick={() => doValidate()}
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
      </div>
    </div>
  );
};

export default W3CValidator;
