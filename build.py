import sys

inputDirectory = "src/"
inputFiles = {
    "js": [
        "feature.js",
        "features/emote.js",
        "features/preview.js",
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

def build():
    print("\nBuilding " + outputDirectory + outputFile)

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


def watch():
    print("\nWatching for changes...")


def help():
    print("\nBuild tools for Vowsh.\n")
    print("  --help (-h)  Show options.")
    print("  --build (-b)  Build the extension.")
    print("  --watch (-w)  Watch for changes and rebuild.")


if len(sys.argv) < 2:
    print('Use -h (or --help) for available options.')
elif '-h' in sys.argv or '--help' in sys.argv:
    help()
elif '-b' in sys.argv or '--build' in sys.argv:
    build()
elif '-w' in sys.argv or '--watch' in sys.argv:
    watch()
else:
    print('Unknown option. Try -h (or --help) for available options')


