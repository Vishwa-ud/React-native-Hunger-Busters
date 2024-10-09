import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { usePathname } from 'expo-router';

const RecipeDetails = () => {
  const router = useRouter();
  const pathname = usePathname();
  const recipeId = pathname.split('/').pop(); // Get recipeId from URL path
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        if (!recipeId) throw new Error('Recipe ID is missing');

        const response = await axios.get(`${apiUrl}/api/recipes/${recipeId}`);
        setRecipe(response.data);
        console.log("Fetched recipe details:", response.data); // Check what is being fetched
      } catch (error) {
        setError(error.message || 'Error fetching recipe details. Please try again later.');
        console.error("Error fetching recipe details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId, apiUrl]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/api/recipes/delete/${recipeId}`);
      Alert.alert('Success', 'Recipe deleted successfully');
      router.push('/RecipeList');
    } catch (error) {
      console.error("Error deleting recipe", error);
      Alert.alert('Error', 'Failed to delete recipe');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${apiUrl}/api/recipes/update/${recipeId}`, recipe);
      Alert.alert('Success', 'Recipe updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error("Error updating recipe", error);
      Alert.alert('Error', 'Failed to update recipe');
    }
  };

  const handleInputChange = (field, value) => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [field]: value,
    }));
  };

  const openYouTubeVideo = () => {
    if (recipe.videoLink) {
      // Open the YouTube video in the browser
      Linking.openURL(recipe.videoLink).catch(err => console.error("Failed to open URL:", err));
    } else {
      Alert.alert('Error', 'No video link available.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text>Loading recipe details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text>No recipe details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>

      <Text style={styles.label}>Description:</Text>
      {editMode ? (
        <TextInput
          style={styles.input}
          value={recipe.description}
          onChangeText={(text) => handleInputChange('description', text)}
        />
      ) : (
        <Text style={styles.description}>{recipe.description || "No description available."}</Text>
      )}

      <Text style={styles.label}>Ingredients:</Text>
      {editMode ? (
        recipe.ingredients.map((ingredient, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={ingredient}
            onChangeText={(text) => {
              const updatedIngredients = [...recipe.ingredients];
              updatedIngredients[index] = text;
              handleInputChange('ingredients', updatedIngredients);
            }}
          />
        ))
      ) : (
        recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredient}>{ingredient}</Text>
        ))
      )}

      <Text style={styles.label}>Method:</Text>
      {editMode ? (
        recipe.method.map((step, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={step}
            onChangeText={(text) => {
              const updatedMethod = [...recipe.method];
              updatedMethod[index] = text;
              handleInputChange('method', updatedMethod);
            }}
          />
        ))
      ) : (
        recipe.method.map((step, index) => (
          <Text key={index} style={styles.step}>{step}</Text>
        ))
      )}

      {recipe.videoLink && (
        <View style={styles.videoContainer}>
          <Text style={styles.label}>Watch Video:</Text>
          <TouchableOpacity onPress={openYouTubeVideo}>
            <Text style={styles.videoLink}>Open Video on YouTube</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title={editMode ? 'Save Changes' : 'Edit Recipe'} onPress={editMode ? handleUpdate : () => setEditMode(!editMode)} />
        <Button title="Delete Recipe" onPress={handleDelete} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  ingredient: {
    fontSize: 16,
    marginVertical: 5,
  },
  step: {
    fontSize: 16,
    marginVertical: 5,
  },
  videoContainer: {
    marginVertical: 20,
  },
  videoLink: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
});

export default RecipeDetails;
