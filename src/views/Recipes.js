import { CardHeader, CardMedia, Divider, IconButton, Paper, TextField, Card, CardContent, Typography } from "@mui/material";
import { FilterOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Modal, Popover, Tag } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import NewRecipe from "./Components/NewRecipe";
import {Buffer} from 'buffer'
import RecipeOptions from "./Components/RecipeOptions";

const initialFormState = {
    name: "",
    description: "",
    ingredients: [],
    instructions: {},
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    servings: 0,
    owner: "",
    tags: [],
}

function Recipes({getMyRecipes, recipes, setRecipes, lists, setLists, filteredRecipes, setFilteredRecipes, focusedList, filterRecipes, setDragging}) {
    const [recipeForm, setRecipeForm] = useState(initialFormState)
    const [recipePreview, setRecipePreview] = useState()



    //controls whether or no to show new recipe module
    const [ adding, setAdding ] = useState(false)

    const [editing, setEditing] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState(null)

    //controls whether or not to show delete confirmation
    const [deleting, setDeleting] = useState(false)

    //sets unique color for every word to have good looking tags
    const colorTag = (string) => {

    
        //alert(string.length);
    
        if(string.length === 0){
            return "#3c7ee8"
        }else{
            var sanitized = string.replace(/[^A-Za-z]/, '');
            var letters = sanitized.split('');
            if(letters.length < 1){
                return '#3c7ee8'
            }
            //Determine the hue
                var hue = Math.floor((letters[0].toLowerCase().charCodeAt()-96)/26*360);
                var ord = '';
                for(var i in letters){
                    ord = letters[i].charCodeAt();
                    if((ord >= 65 && ord <= 90) || (ord >= 97 && ord <= 122)){
                        hue += ord-64;
                    }
                }
    
                hue = hue%360;
    
            //Determine the saturation
                var vowels = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u'];
                var count_cons = 0;
    
                //Count the consonants
                for(i in letters){
                    if(vowels.indexOf(letters[i]) === -1){
                        count_cons++;
                    }
                }
    
                //Determine what percentage of the string is consonants and weight to 95% being fully saturated.
                var saturation = count_cons/letters.length/0.95*100;
                if(saturation > 100) saturation = 100;
    
            //Determine the luminosity
                var ascenders = ['t','d','b','l','f','h','k'];
                var descenders = ['q','y','p','g','j'];
                var luminosity = 50;
                var increment = 1/letters.length*40;
    
                for(i in letters){
                    if(ascenders.indexOf(letters[i]) !== -1){
                        luminosity += increment;
                    }else if(descenders.indexOf(letters[i]) !== -1){
                        luminosity -= increment*2;
                    }
                }
                if(luminosity > 100) luminosity = 100;
    

                // Convert HSL to RGB
                var hslToRgb = (h, s, l) => {
                    h /= 360;
                    s /= 100;
                    l /= 100;

                    var r, g, b;

                    if (s === 0) {
                        r = g = b = l; // achromatic
                    } else {
                        var hue2rgb = (p, q, t) => {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1 / 6) return p + (q - p) * 6 * t;
                            if (t < 1 / 2) return q;
                            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                            return p;
                        };

                        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        var p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1 / 3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1 / 3);
                    }

                    var toHex = (c) => {
                        var hex = Math.round(c * 255).toString(16);
                        return hex.length === 1 ? "0" + hex : hex;
                    };

                    return "#" + toHex(r) + toHex(g) + toHex(b);
                };

                return hslToRgb(hue, saturation, luminosity);
        }
    }

    function getReadableFontColor(backgroundHexColor) {
        // Remove the '#' symbol from the background color string
        backgroundHexColor = backgroundHexColor.replace('#', '');
      
        // Convert the hex color to its RGB representation
        var r = parseInt(backgroundHexColor.substr(0, 2), 16);
        var g = parseInt(backgroundHexColor.substr(2, 2), 16);
        var b = parseInt(backgroundHexColor.substr(4, 2), 16);
      
        // Calculate the relative luminance of the background color
        var relativeLuminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      
        // Calculate the contrast ratio with black (0, 0, 0)
        var contrastWithBlack = (relativeLuminance + 0.05) / .45;
      
        // Calculate the contrast ratio with white (255, 255, 255)
        var contrastWithWhite = (1.05) / (relativeLuminance + 0.05);
      
        // Determine the recommended font color based on the contrast ratios
        var fontColor = (contrastWithBlack > contrastWithWhite) ? '#000000' : '#ffffff';
      
        return fontColor;
      }


    const handleRecipeSubmission = () => {
        const recipeFormData = new FormData()
        Object.entries(recipeForm).forEach(([key, value]) => {
            //stringify objects and arrays to store in database
            if(key === "instructions" || key === "ingredients" || key === "tags"){
                recipeFormData.append(key, JSON.stringify(value))
            } else {
                recipeFormData.append(key, value);
            }
            
          });
        console.log(recipeFormData)
        axios({
            method:"post",
            url:`http://localhost:8000/recipes/${sessionStorage.getItem("userId")}`,
            data: recipeFormData,
            headers:{'authorization':`bearer ${sessionStorage.getItem("token")}`, 'Content-Type':'multipart/form-data'},
        }).then(res => {
                // reset recipe form and add recipe to state
                let recipe = res.data.recipe
                setAdding(false)
                setRecipeForm(initialFormState)
                if(recipe.image){
                    const base64String = Buffer.from(recipe.image).toString('base64');
                    recipe = {...recipe._doc, image:base64String}
                }
                getMyRecipes();
            })
            .catch(err=>{
                console.log(err)
            })
    }

    const handleEditRecipe = () => {
        const recipeFormData = new FormData()
        Object.entries(recipeForm).forEach(([key, value]) => {
            console.log(key,value)
            if(key === "ingredients"){
                value.forEach(ingredient => {
                    delete ingredient["_id"]
                })
            }
            //stringify objects and arrays to store in database
            if(key === "instructions" || key === "ingredients" || key === "tags"){
                recipeFormData.append(key, JSON.stringify(value))
            } else if (key === "image" && typeof value !== "string"){
                recipeFormData.append(key,value)
            } else if (key !== "_id" && key !== "image") {
                recipeFormData.append(key, value);
            }
            
          });
          console.log(recipeFormData)

        axios({
            method:"put",
            url:`http://localhost:8000/recipes/${recipeForm._id}`,
            data: recipeFormData,
            headers:{'authorization':`bearer ${sessionStorage.getItem("token")}`, 'Content-Type':'multipart/form-data'},
        }).then(res => {
                // reset recipe form and add recipe to state
                let recipe = res.data.recipe
                setAdding(false)
                setEditing(false)
                setEditingRecipe(null)
                setRecipeForm(initialFormState)
                if(recipe.image){
                    const base64String = Buffer.from(recipe.image).toString('base64');
                    recipe = {...recipe._doc, image:base64String}
                }
                
                getMyRecipes();
            })
            .catch(err=>{
                console.log(err)
            })
    }

    const handleDeleteRecipe = () => {
        const recipeId = deleting._id
        axios({
            method:"post",
            url:"http://localhost:8000/recipes/delete",
            headers:{'authorization':`bearer ${sessionStorage.getItem("token")}`},
            data:{recipeId},
        }).then(res => {
            const deletedRecipe = res.data.recipe
            const filteredArray = recipes.filter(recipe => recipe._id !== deletedRecipe._id)
            setRecipes([...filteredArray])
            setDeleting(false)
        })
        .catch(function(e){
            console.log(e)
        })
    }

    return (
        <div>
            <Paper 
            className="recipe-book-container"
            id="recipe-book-container"
            elevation={12} 
            style={{
                width: "80vw",
                height: "85vh",
                margin: "auto",
                transform: "translate(0,5%)",
                display: "flex",
                flexDirection: "column"
            }}>
                <div style={{display:"flex", justifyContent:"space-around"}}>
                    <div className="filter-container" style={{display:"flex", justifyContent:"space-around", width:"30rem"}}>
                        <TextField id="outlined-basic" label="Search" variant="outlined" style={{width:"20rem", margin:"1rem"}}/>
                        <IconButton style={{margin:"auto"}}><FilterOutlined/></IconButton>  
                    </div>
                    <Typography style={{margin:"auto"}}>{focusedList}</Typography>
                    <div style={{margin:"auto 2rem auto auto", right:"0", display:"flex", justifySelf:"right"}} className="new-recipe-button-container">
                        <Button onClick={()=>setAdding(true)}><PlusOutlined/>New Recipe</Button>
                    </div>
                </div>
                <Divider/>
                <div style={{display:"flex", flexFlow:"wrap", overflow:"scroll", justifyContent:"flex-start"}}>
                    {filteredRecipes.map(recipe => {
                        //sets popover content
                        const overflowDescriptionContent = (<div style={{width:"15rem", height:"10rem", overflow:"scroll", padding:"6px"}} >{recipe.description}</div>)
                        const ingredientContent = (<div style={{width:"15rem", height:"10rem", overflow:"scroll", padding:"6px"}} >
                                {recipe.ingredients.map(ingredient => 
                                    <p>{ingredient.amount}{ingredient.unit} {ingredient.name}</p>
                                )}
                            </div>)
                        return(
                            <Card style={{ width: 345, margin:"1rem" }} draggable onDrag={(e)=>setDragging(recipe._id)}>
                                <CardHeader
                                    title= {recipe.name}
                                    subheader={<p style={{fontSize:"14.25px", margin:"0"}}>prep: {recipe.prepTime}min | cook: {recipe.cookTime}min | total: {recipe.totalTime}min</p>}
                                    action={
                                        <Popover content={<RecipeOptions lists={lists} recipeId={recipe._id} setLists={setLists} setEditing={setEditing} recipe={recipe} setRecipeForm={setRecipeForm} setRecipePreview={setRecipePreview} setDeleting={setDeleting}/> }  placement="rightTop" trigger={"focus"}>
                                            <IconButton>                                                
                                                    <MoreOutlined/>
                                            </IconButton> 
                                        </Popover>
                                        
                                    }
                                />
                                <CardMedia 
                                component="img"
                                height="194"
                                image={`data:image/png;base64,${recipe.image}`}/>
                                <CardContent>
                                    <Typography style={{height:"45px"}}>
                                        {recipe.description.length > 80 ? recipe.description.substring(0,80) : recipe.description }
                                        {recipe.description.length > 80 ? <Popover content={overflowDescriptionContent}>...</Popover> : null}
                                    </Typography>
                                    <div style={{height:"25px", display:"flex", width:"100%", overflow:"auto", margin:".5rem auto auto auto", whiteSpace:"nowrap", paddingBottom:"15px"}}>
                                        {recipe.tags.map(tag => {
                                            return(
                                                <Tag color={colorTag(tag)} style={{color:getReadableFontColor(colorTag(tag))}}>
                                                    {tag}
                                                </Tag>
                                            )
                                        })}
                                    </div>
                                    </CardContent>
                            </Card>
                        )
                    })}  
                </div>
            </Paper>
            <Modal open={adding} onCancel={()=>{setAdding(false); setRecipeForm(initialFormState); setEditing(false); setEditingRecipe({})}} onOk={()=>{handleRecipeSubmission()}} style={{minWidth:"80vw"}}>
                <NewRecipe recipeForm={recipeForm} setRecipeForm={setRecipeForm} recipePreview={recipePreview} setRecipePreview={setRecipePreview}/>
            </Modal>
            <Modal open={editing} onCancel={()=>{setRecipeForm(initialFormState); setEditing(false); setEditingRecipe({})}} onOk={()=>{handleEditRecipe()}} style={{minWidth:"80vw"}}>
                <NewRecipe recipeForm={recipeForm} setRecipeForm={setRecipeForm} editingRecipe={editingRecipe} editing={editing} recipePreview={recipePreview} setRecipePreview={setRecipePreview}/>
            </Modal>
            <Modal open={deleting !== false} onCancel={()=>{setDeleting(false)}} title="Delete Recipe?" okText="Delete" cancelText="Cancel" onOk={()=>handleDeleteRecipe()}><p>Are you sure you want to delete {deleting.name}?</p></Modal>
        </div>
    );
}

export default Recipes;