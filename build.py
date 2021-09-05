import sys
import json

inputDirectory = "src/"
inputFiles = {
    "js": [
        "feature.js",
        "features/emoteGrab.js",
        "features/moreEmotes.js",
        "features/linkPreview.js",
        "features/autocomplete.js",
        "features/settings.js",
        "vowsh.js"
    ],
    "css": [
        "vowsh.css"
    ]
}

outputDirectory = "dist/"
outputFile = "vowshapp"

def sizeof(str):
    size = sys.getsizeof(str)
    for unit in ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi']:
        if abs(size) < 1024.0:
            return "%3.1f %sB" % (size, unit)
        size /= 1024.0
    return "%.1f %sB" % (size, 'Yi')

def copy(manifest):
    if manifest != 2 and manifest != 3:
        raise Exception('No such manifest version: ' + str(manifest))
    
    source = open('manifests/v' + str(manifest) + '.json', 'r')
    destination = open('manifest.json', 'w')
    destination.write(source.read())
    destination.close()
    source.close()

def build(manifest):
    m = 2 if manifest == -1 else manifest
    print("\nBuilding " + outputDirectory + outputFile + " using manifest v" + str(m))

    copy(m)
    
    for extension, files in inputFiles.items():
        print("Generating " + str(len(files)) + " " + extension + " files... ", end='')
        lines = ""
        destination = open(outputDirectory + outputFile + "." + extension, "w")
        for file in files:
            source = open(inputDirectory + file, "r")
            lines += source.read() + "\n\n"
            source.close()

        destination.write(lines)
        destination.close()
        print("done! (" + sizeof(lines) + ")")
    
    if manifest == -1:
        build(3)


def watch(manifest):
    print("\nNot yet implemented. :(")


def help():
    print("\nBuild tools for Vowsh.\n")
    print("  --help (-h)  Show options.")
    print("  --build (-b)  Build the extension.")
    print("  --watch (-w)  Watch for changes and rebuild.")
    print("")
    print("Build/watch options:")
    print("  >  --v2 (-2)  Build using Manifest v2.")
    print("  >  --v3 (-3)  Build using Manifest v3.")


manifest = -1
if '-2' in sys.argv or '--v2' in sys.argv:
    manifest = 2
elif '-3' in sys.argv or '--v3' in sys.argv:
    manifest = 3

if '-h' in sys.argv or '--help' in sys.argv:
    help()
elif '-b' in sys.argv or '--build' in sys.argv:
    build(manifest)
elif '-w' in sys.argv or '--watch' in sys.argv:
    watch(manifest)
else:
    print('Unknown option. Try -h (or --help) for available options')


