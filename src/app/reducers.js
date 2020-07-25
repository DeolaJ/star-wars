// import {
// } from "./actions"
  
export const defaultState = {
  
}

export default function appReducers (state=defaultState, action) {
  const { type, payload } = action
  
  switch (type) {

    // case RESET_PROGRESS: {
    //   return {
    //     ...state,
    //     ...payload
    //   }
    // }

    default: {
      return state
    }
  }
}
  