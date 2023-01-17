import { createSlice } from "@reduxjs/toolkit";
const courses = []



const courseSlice = createSlice({
    name: 'courses',
    initialState: courses,
    reducers: {
        addCourse(state, action) {
            return courses.append(action.payload)
        },
        setCourses(state, action){
            return action.payload
        }
    }
})

export default courseSlice.reducer
export const {addCourse, setCourses} = courseSlice.actions