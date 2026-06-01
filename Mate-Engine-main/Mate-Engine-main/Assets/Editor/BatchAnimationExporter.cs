using UnityEngine;
using UnityEditor;
using UnityEditor.Formats.Fbx.Exporter;
using System.IO;

public class BatchAnimationExporter : EditorWindow
{
    // The dummy model to use (e.g. Robot Kyle)
    public GameObject modelPrefab;
    // Where to save the FBX files
    public string exportPath = "Assets/ExportedAnimations";

    [MenuItem("Tools/Batch Convert Animations")]
    public static void ShowWindow()
    {
        GetWindow<BatchAnimationExporter>("Batch Exporter");
    }

    void OnGUI()
    {
        GUILayout.Label("Batch Animation Exporter", EditorStyles.boldLabel);

        modelPrefab = (GameObject)EditorGUILayout.ObjectField("Model (Robot Kyle)", modelPrefab, typeof(GameObject), false);
        exportPath = EditorGUILayout.TextField("Export Path", exportPath);

        if (GUILayout.Button("Export Selected Animations"))
        {
            ExportSelected();
        }
    }

    void ExportSelected()
    {
        if (modelPrefab == null)
        {
            Debug.LogError("Please assign a Model (like Robot Kyle) first!");
            return;
        }

        // Create the export directory if it doesn't exist
        if (!Directory.Exists(exportPath))
        {
            Directory.CreateDirectory(exportPath);
        }

        Object[] selection = Selection.objects;
        int count = 0;

        foreach (Object obj in selection)
        {
            if (obj is AnimationClip)
            {
                AnimationClip clip = (AnimationClip)obj;
                ExportSingleClip(clip);
                count++;
            }
        }

        Debug.Log($"Batch Export Complete! Processed {count} animations.");
        AssetDatabase.Refresh();
    }

    void ExportSingleClip(AnimationClip clip)
    {
        // 1. Instantiate the Dummy Model
        GameObject instance = Instantiate(modelPrefab);
        instance.name = clip.name; // Name the FBX after the clip

        // 2. Add an Animator if missing
        Animator animator = instance.GetComponent<Animator>();
        if (animator == null) animator = instance.AddComponent<Animator>();

        // 3. Create a temporary override controller to apply the clip
        var controller = UnityEditor.Animations.AnimatorController.CreateAnimatorControllerAtPathWithClip("Assets/TempController.controller", clip);
        animator.runtimeAnimatorController = controller;
        
        // 4. Export
        string filePath = Path.Combine(exportPath, clip.name + ".fbx");
        
        // Note: This requires the "FBX Exporter" package to be installed!
        ModelExporter.ExportObject(filePath, instance);

        // 5. Cleanup
        DestroyImmediate(instance);
        AssetDatabase.DeleteAsset("Assets/TempController.controller");
    }
}
