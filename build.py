import sys, os
import json, base64

import shutil
import hashlib

inputDirectory = 'src/'
inputFiles = {
    'js': [
        'feature.js',
        'features/emoteGrab.js',
        'features/moreEmotes.js',
        'features/linkPreview.js',
        'features/autocomplete.js',
        'features/settings.js',
        'vowsh.js'
    ],
    'css': [
        'vowsh.css'
    ]
}

outputDirectory = 'dist/'
outputFile = 'vowshapp'


def sizeof(str):
    size = sys.getsizeof(str)
    for unit in ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi']:
        if abs(size) < 1024.0:
            return '%3.1f %sB' % (size, unit)
        size /= 1024.0
    return '%.1f %sB' % (size, 'Yi')


def build_lib():
    if not os.path.exists('dist/lib'):
        os.makedirs('dist/lib')

    include = ['bootstrap-3.4.1.min.css', 'bootstrap-3.4.1.min.js', 'jquery-3.6.0.min.js', 'popper-1.14.3.min.js']
    for lib in include:
        shutil.copy('lib/' + lib, 'dist/lib/' + lib)
    

def build_src():
    for extension, files in inputFiles.items():
        print('Generating ' + str(len(files)) + ' ' + extension + ' files... ', end='')
        lines = ''
        destination = open(outputDirectory + outputFile + '.' + extension, 'w')
        for file in files:
            source = open(inputDirectory + file, 'r')
            lines += source.read() + '\n\n'
            source.close()

        destination.write(lines)
        destination.close()

        # TODO: ZIP build
        print('done! (' + sizeof(lines) + ')')


def build_manifest(version):
    source = open('src/manifests/v' + str(2 if version == -1 else version) + '.json', 'r')
    destination = open('dist/manifest.json', 'w')
    
    print('Calculating script-src hash... ', end='')
    xhookFile = open('src/xhook.js', 'r')
    xhook = xhookFile.read()
    sha256 = hashlib.sha256()
    sha256.update(xhook.split('`')[1].encode())
    xhookHash = base64.b64encode(sha256.digest()).decode()
    xhookFile.close()
    print('done! (' + xhookHash + ')')

    manifest = json.loads(source.read())
    csp = "script-src 'self' 'sha256-" + xhookHash + "'; object-src 'none';"
    manifest['content_security_policy'] = csp if version == 2 else {"extension_pages": csp}
    destination.write(json.dumps(manifest, indent=2))
    
    destination.close()
    source.close()

def build(version):
    print('\nBuilding ' + outputDirectory + outputFile + ' for ' + str('all platforms' if version == -1 else ('Manifest v' + str(version))))
    if not os.path.exists('dist'):
        os.makedirs('dist')

    shutil.copy('src/icon.png', 'dist/icon.png')
    shutil.copy('src/xhook.js', 'dist/xhook.js')

    build_lib()
    build_src()
    build_manifest(version)
    
    if version == -1:
        build(3)


def watch(manifest):
    print('\nNot yet implemented. :(')


def help():
    print('\nBuild tools for Vowsh.\n')
    print('  --help (-h)  Show options.')
    print('  --build (-b)  Build the extension.')
    print('  --watch (-w)  Watch for changes and rebuild.')
    print('')
    print('Build/watch options:')
    print('  >  --v2 (-2)  Build using Manifest v2.')
    print('  >  --v3 (-3)  Build using Manifest v3.')


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


