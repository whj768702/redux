function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': {
      return {
        ...state,
        count: state.count + 1,
      };
    }
    case 'DECREMENT': {
      return {
        ...state,
        count: state.count - 1,
      };
    }
    default:
      return state;
  }
}

const createStore = function (reducer, initState) {
  let state = initState;
  let listeners = [];
  function subscribe(listener) {
    listeners.push(listener);
  }
  function dispatch(action) {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }
  function getState() {
    return state;
  }

  return {
    subscribe,
    changeState,
    getState,
  };
};

let initState = {
  count: 0,
};

let store = createStore(reducer, initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state.count);
});
store.dispatch({
  type: 'INCREMENT',
});
store.dispatch({
  type: 'DECREMENT',
});

store.dispatch({
  count: 'abc',
});
