import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Form, List, InputNumber, Upload, Select, Alert, Tag } from "antd";
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import VirtualList from "rc-virtual-list"

//units used in type of measurement dropdown
const unitsOfMeasurement = [
    { 
        value: "",
        label:"N/A"
    },
    {
        value:"tsp",
        label:"Teaspoon"
    },
    {
        value:"tbsp",
        label:"Tablespoon"
    },
    {
        value:"oz",
        label:"Ounce"
    },
    {
        value:"c",
        label:"Cup"
    },
    {
        value:"pt",
        label:"Pint"
    },
    {
        value:"qt",
        label:"Quart"
    },
    {
        value:"g",
        label:"Gallon"
    },
]


function NewRecipe({recipeForm, setRecipeForm, editingRecipe, editing, recipePreview, setRecipePreview}) {
    const [newIngredient, setNewIngredient] = useState({unit:undefined,amount:undefined,name:undefined})
    const [newStep, setNewStep] = useState()
    const [ingredientError, setIngredientError] = useState(false)
    const [editingStep, setEditingStep] = useState({step:0,instruction:""})
    const [tagInputVisible, setTagInputVisible] = useState(false)
    const [newTag, setNewTag] = useState("")
    const tagInputRef = useRef(null)
    
   
    function setEditingRecipe() {
        if(editing){
            setRecipeForm(editingRecipe)
            setRecipePreview(`data:image/png;base64,${editingRecipe.image}`)
            return "editing"
        } else {
            return "not editing"
        }
    }
    

    //handles changing form values
    const handleChange = (e,j) => {
        if(e.file){
            setRecipeForm({...recipeForm, image:e.file})

            //reads image as url to display as preview
            const imageReader = new FileReader() 
            imageReader.onload = function(e) {
                setRecipePreview(e.target.result)
            }
            imageReader.readAsDataURL(e.file)
        } else if(e.target) {
            setRecipeForm({...recipeForm, [e.target.name]:e.target.value}) 
        } else if(j.includes("prep")){
            setRecipeForm({...recipeForm, [j]:e, totalTime:e+recipeForm.cookTime}) //set prep time and calc new total time
        } else if(j.includes("cook")){
            setRecipeForm({...recipeForm, [j]:e, totalTime:e+recipeForm.prepTime}) //set cook time and calc new total time
        } else {
            setRecipeForm({...recipeForm, [j]:e}) 
        }
    }

    //handles adding a new ingredient
    const addIngredient = () => {
        const foundIngredient = recipeForm.ingredients.find(obj => obj.name === newIngredient.name);
        if(!foundIngredient){ //adds new ingredient to array
            setRecipeForm({...recipeForm, ingredients:[...recipeForm.ingredients, newIngredient]})  
            setNewIngredient({unit:undefined,amount:undefined,name:undefined})
        } else {   //if ingredient is already added, alert is raised
            setIngredientError(true)
            setNewIngredient({unit:undefined,amount:undefined,name:undefined})
        }
        
    }

    //closes ingredient already existing alert
    const handleClose = () => {
        setIngredientError(false)
    }

    //holds new ingredient before it is added
    const handleNewIngredient = (v,n) => {
        setNewIngredient({...newIngredient, [n]:v}) 
    }

    //removes selected ingredient
    const handleRemoveIngredient = (i) => {
        const updatedArray = recipeForm.ingredients.filter(ingredient => ingredient.name !== i)
        setRecipeForm({...recipeForm, ingredients:updatedArray})
    }

    //holds edits to target step
    const handleEditStep=(stepNumber)=>{
        setEditingStep({step:stepNumber, instruction:recipeForm.instructions[stepNumber]})
    }

    //saves the stored edit
    const saveEdit = () => {
        const {step,instruction} = editingStep
        setRecipeForm({...recipeForm, instructions:{...recipeForm.instructions, [step]:instruction}})
        setEditingStep({step:0,instruction:""})
    }

    //delete existing step, currently only works on last step
    const handleDeleteStep=(s)=>{
        const {[s]:value, ...remaining} = recipeForm.instructions
        setRecipeForm({...recipeForm, instructions:remaining})
    }

    //add new step
    const addStep = () => {
        if(newStep.length > 0){
            const stepNumber = Object.keys(recipeForm.instructions).length + 1
            setRecipeForm({...recipeForm, instructions:{...recipeForm.instructions, [stepNumber]:newStep}})
            setNewStep("")
        }
    }

    //stores new tag
    const handleNewTagChange = (e) => {
        setNewTag(e.target.value)
    }
    
    //adds new tag to array
    const handleNewTag = () => {
        if(newTag && recipeForm.tags.indexOf(newTag) === -1){
            setRecipeForm({...recipeForm, tags:[...recipeForm.tags, newTag]})
        }
        setTagInputVisible(false)
        setNewTag("")
    }

    //closes the new tag input
    const handleCloseTag = (t) => {
        const updatedTags = recipeForm.tags.filter(tag => tag !== t)
        setRecipeForm({...recipeForm, tags:updatedTags})
    }

    //auto focus new tag input
    useEffect(()=>{tagInputRef.current?.focus()},[tagInputVisible])

    return (
        <Form style={{margin:"2rem auto", minWidth:"80%", fontSize:"50px"}} layout="vertical" >
            <Form.Item style={{width:"25rem", margin:"2rem auto 0"}} label="Title">
                <Input id="name-input" name="name" onChange={handleChange} value={recipeForm.name} />
            </Form.Item>
            <div style={{width:"40rem", margin:"0 auto"}}>
                {recipeForm.tags.map((tag,index) => {
                    return(
                    <Tag closable={true} onClose={() => handleCloseTag()} key={tag}>
                        {tag}
                    </Tag>
                    )
                })}
                {tagInputVisible ? 
                    <Input ref={tagInputRef} size="small" style={{width:78}} onPressEnter={() => handleNewTag()} onChange={(e) => handleNewTagChange(e)} value={newTag} onBlur={() => handleNewTag()}/>
                    : 
                    <Tag onClick={() => {setTagInputVisible(true)}}>
                        <PlusOutlined /> New Tag
                    </Tag>
                }
            </div>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-around"}}>
                <Form.Item style={{width:"60%", margin:"auto 0"}} label="Description">
                    <TextArea id="description-input" name="description" onChange={handleChange} value={recipeForm.description} style={{resize: 'none' }} rows={10}/>
                </Form.Item>
                <Form.Item label="Recipe Image" style={{width:"30%"}}>
                    <Upload.Dragger id="image-input" name="image" listType="picture-card" customRequest={handleChange} showUploadList={false} style={{width:"100%"}}>
                          {recipeForm.image ? <img src={recipePreview} alt="recipe preview" style={{width:"80%"}}/> : <div style={{}}><PlusOutlined/><div>Upload</div></div>}  
                    </Upload.Dragger>
                </Form.Item>
            </div>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-around", marginTop:"1rem"}}>
                <div style={{width:"45%"}}>
                    <Form.Item label="Ingredients" style={{width:"100%"}}>
                        <List style={{border:"1px dashed grey", padding:"0 1rem"}}>
                            <VirtualList
                                id="ingredients-list" 
                                name="ingredients" 
                                data={recipeForm.ingredients}
                                height={200}
                            >
                                {(ingredient) => (
                                    <List.Item key={ingredient.name} actions={[<DeleteOutlined onClick={()=>{handleRemoveIngredient(ingredient.name)}}/>]}>
                                        <List.Item.Meta
                                            avatar={ingredient.amount + " " + ingredient.unit}
                                            title={ingredient.name}
                                            />
                                    </List.Item>
                                )}
                            </VirtualList>
                        </List>
                    </Form.Item>
                    {ingredientError && (<Alert message="Ingredient is already in list" type="error" closable afterClose={handleClose} />)}
                    <div style={{display:"flex", flexDirection:"row", width:"100%"}}>
                        <InputNumber placeholder="Amount" name="amount" onChange={(e)=>handleNewIngredient(e,"amount")} value={newIngredient.amount} min={0} style={{width: 150}}/>
                        <Select placeholder="Unit" name="unit" options={unitsOfMeasurement} onChange={(e)=>handleNewIngredient(e,"unit")} onClear={(e)=>handleNewIngredient(e,"unit")} value={newIngredient.unit} style={{width: 200}}/>
                        <Input placeholder="New Ingredient" name="name" value={newIngredient.name} onChange={(e) => handleNewIngredient(e.target.value.toLowerCase(),"name")}/>
                        <Button onClick={()=>addIngredient()}>Add</Button>
                    </div>
                </div>
                <div style={{width:"45%"}}>
                    <Form.Item label="Instructions" style={{width:"100%"}}>
                        <List style={{border:"1px dashed grey", padding:"0 1rem"}}>
                            <VirtualList
                                id="instructions-list" 
                                name="instructions" 
                                data={Object.keys(recipeForm.instructions)}
                                height={200}
                            >
                                {(stepNumber) => (
                                    <List.Item key={stepNumber} actions={[editingStep.step == parseInt(stepNumber) ? <CheckOutlined onClick={()=>{saveEdit()}}/> : <EditOutlined onClick={()=>{handleEditStep(stepNumber)}}/>,parseInt(stepNumber) === Object.keys(recipeForm.instructions).length && <DeleteOutlined onClick={()=>{handleDeleteStep(stepNumber)}}/>]}>
                                        <List.Item.Meta
                                            avatar={stepNumber}
                                            description={editingStep.step == parseInt(stepNumber) ? <TextArea value={editingStep.instruction} onChange={e=>setEditingStep({...editingStep, instruction:e.target.value})}/> : recipeForm.instructions[stepNumber]}
                                            />
                                    </List.Item>
                                )}
                            </VirtualList>
                        </List>
                    </Form.Item>
                    
                    <div style={{display:"flex", flexDirection:"row", width:"100%"}}>
                        <TextArea placeholder="New Step" value={newStep} onChange={(e)=>setNewStep(e.target.value)} onPressEnter={()=>addStep()} autoSize/>
                        <Button onClick={()=>addStep()}>Add</Button>
                    </div>
                </div>
            </div>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly", width:"70%", margin:"1rem auto"}}>
                <Form.Item label="Prep Time" style={{width:"6.7rem"}}>
                    <InputNumber id="prep-time-input" name="prepTime" onChange={(e) => {handleChange(e,"prepTime")}} value={recipeForm.prepTime} min={0} addonAfter="min"/>
                </Form.Item>
                <Form.Item label="Cook Time" style={{width:"6.7rem"}}>
                    <InputNumber id="cook-time-input" name="cookTime" onChange={(e) => {handleChange(e,"cookTime")}} value={recipeForm.cookTime} min={0} addonAfter="min"/>
                </Form.Item>
                <Form.Item label="Total Time" style={{width:"6.7rem"}}>
                    <InputNumber id="total-time-input" name="totalTime" onChange={(e) => handleChange(e,"totalTime")} value={recipeForm.totalTime} min={0} addonAfter="min"/>
                </Form.Item>
                <Form.Item label="Servings">
                    <InputNumber id="servings-input" name="servings" onChange={(e) => handleChange(e,"servings")} value={recipeForm.servings} min={0}/>
                </Form.Item>  
            </div>
        </Form>
    );
}

export default NewRecipe;

