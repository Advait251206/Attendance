using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public class PoseDumper : EditorWindow
{
    [MenuItem("Tools/Dump Current Pose")]
    public static void DumpPose()
    {
        GameObject target = Selection.activeGameObject;
        if (target == null)
        {
            Debug.LogError("Please select the Root object (e.g. Hatsune_Miku).");
            return;
        }

        string path = EditorUtility.SaveFilePanel("Save Pose JSON", "", "pose_sit", "json");
        if (string.IsNullOrEmpty(path)) return;

        var boneData = new Dictionary<string, BoneTransform>();
        Transform[] allChildren = target.GetComponentsInChildren<Transform>();

        foreach (Transform t in allChildren)
        {
            // We store Local Rotation/Position
            // Used for retargeting later
            boneData[t.name] = new BoneTransform
            {
                pos = new float[] { t.localPosition.x, t.localPosition.y, t.localPosition.z },
                rot = new float[] { t.localRotation.x, t.localRotation.y, t.localRotation.z, t.localRotation.w }
            };
        }

        string json = JsonUtility.ToJson(new SerializationWrapper { bones = boneData.Keys.ToArray(), data = boneData.Values.ToArray() }, true);
        
        // Custom simple JSON formatter because Unity's JsonUtility is weird with Dictionaries
        // Actually, let's just make a simple list wrapper to be safe
        var exportList = new List<NamedBoneData>();
        foreach(var create in boneData)
        {
            exportList.Add(new NamedBoneData { name = create.Key, pos = create.Value.pos, rot = create.Value.rot });
        }
        
        string finalJson = "{\n  \"bones\": [\n";
        for(int i=0; i<exportList.Count; i++)
        {
            var b = exportList[i];
            finalJson += $"    {{ \"name\": \"{b.name}\", \"pos\": [{b.pos[0]},{b.pos[1]},{b.pos[2]}], \"rot\": [{b.rot[0]},{b.rot[1]},{b.rot[2]},{b.rot[3]}] }}";
            if (i < exportList.Count - 1) finalJson += ",";
            finalJson += "\n";
        }
        finalJson += "  ]\n}";

        File.WriteAllText(path, finalJson);
        Debug.Log($"Pose Dumped to {path}");
    }

    [System.Serializable]
    public class BoneTransform
    {
        public float[] pos;
        public float[] rot;
    }

    [System.Serializable]
    public class NamedBoneData
    {
        public string name;
        public float[] pos;
        public float[] rot;
    }
    
    [System.Serializable]
    public class SerializationWrapper
    {
        public string[] bones;
        public BoneTransform[] data;
    }
}
