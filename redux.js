// let initState = {
//   count: 0,
// };
function counterReducer(state, action) {
  if (!state) {
    state = initState;
  }
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

function InfoReducer(state, action) {
  switch (action.type) {
    case 'SET_NAME': {
      return {
        ...state,
        name: action.name,
      };
    }
    case 'SET_DESCRIPTION': {
      return {
        ...state,
        descriptioni: action.description,
      };
    }
    default:
      return state;
  }
}

function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  return function combination(state = {}, action) {
    const nextState = {};

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];

      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
    }
    return nextState;
  };
}
const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer,
});

const createStore = function (reducer, initState, rewriteCreateStoreFunc) {
  if (typeof initState === 'function') {
    rewriteCreateStoreFunc = initState;
    initState = undefined;
  }
  if (rewriteCreateStoreFunc) {
    const newCreateStore = rewriteCreateStoreFunc(createStore);
    return newCreateStore(reducer, initState);
  }
  let state = initState;
  let listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
    return function unscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
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

  dispatch({ type: Symbol });

  function replaceReducer(nextReducer) {
    reducer = nextReducer;
    dispatch({ type: Symbol() });
  }

  return {
    subscribe,
    dispatch,
    getState,
    replaceReducer,
  };
};

// let store = createStore(reducer, initState);
const loggerMiddleware = (state) => (next) => (action) => {
  console.log('this state: ', store.getState());
  console.log('action: ', action);
  next(action);
  console.log('next state: ', store.getState());
};

const exceptionMiddleware = (state) => (next) => (action) => {
  try {
    // loggerMiddleware(action);
    next(action);
  } catch (err) {
    console.log('错误报告: ', err);
  }
};

const applyMiddleware = function (...middlewares) {
  return function rewriteCreateStoreFunc(oldCreateStore) {
    return function newCreateStore(reducer, initState) {
      const store = oldCreateStore(reducer, initState);

      // const chain = middlewares.map((middleware) => middleware(store));
      const simpleState = { getState: store.getState };
      const chain = middlewares.map((middleware) => middleware(simpleState));
      let dispatch = store.dispatch;
      chain.reverse().map((middleware) => {
        dispatch = middleware(dispatch);
      });

      store.dispatch = dispatch;
      return store;
    };
  };
};

const rewriteCreateStoreFunc = applyMiddleware(
  exceptionMiddleware,
  loggerMiddleware
);

let initState = {
  counter: {
    count: 0,
  },
  info: {
    name: '测试',
    description: '我是测试的描述',
  },
};

let store = createStore(reducer, initState, rewriteCreateStoreFunc);

const nextReducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer,
});

store.replaceReducer(nextReducer);

const unsubcribe = store.subscribe(() => {
  let state = store.getState();
  console.log('subcribe: ', state.counter.count);
});

store.dispatch({
  type: 'INCREMENT',
});
unsubcribe();
store.dispatch({
  type: 'INCREMENT',
});

// store.subscribe(() => {
//   let state = store.getState();
//   console.log(state.counter.count, state.info.name, state.info.description);
// });
// store.dispatch({
//   type: 'INCREMENT',
// });
// store.dispatch({
//   type: 'SET_NAME',
//   name: '我是修改后的描述',
// });
