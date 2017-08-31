import {
  userFetchStartedType as USER_FETCH_STARTED,
  userReceivedType as USER_RECEIVED,
} from '../actions/actionCreators/userActions';

const initialState = {
  isLoading: false,
};

export default function user(state = initialState, action) {
  switch (action.type) {
    case USER_FETCH_STARTED:
      return {
        isLoading: true,
      };
    case USER_RECEIVED:
      if (!action.user) {
        return false;
      }

      return {
        isLoading: false,
        data: {
          id: action.user.id,
          username: action.user.username,
          email: action.user.email,
          createdAt: action.user.createdAt,
          updatedAt: action.user.updatedAt,
        },
      };
    default:
      return state;
  }
}
