import tensorflow as tf
from tensorflow import keras
from predict import ResidualBlock, WeightedCategoricalCrossentropy
import os

model_path = r"C:\Users\gunad\Downloads\mindcare_integrated\model\recommendation\model.h5"

model = keras.models.load_model(
    model_path,
    custom_objects={
        'ResidualBlock': ResidualBlock,
        'WeightedCategoricalCrossentropy': WeightedCategoricalCrossentropy
    },
    compile=False
)

model.save(r"C:\Users\gunad\Downloads\mindcare_integrated\model\recommendation\model.keras")
print("Saved model to model.keras successfully.")
