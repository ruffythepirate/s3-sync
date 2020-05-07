const sut = require('./SortedPathGenerator');

const fs = require('fs');
const path = require('path');


jest.mock('fs')

test('listFilePathsSorted should yield relative local paths', () => {
    fs.readdirSync.mockReturnValueOnce([
        dirent('b'),
        dirent('a'),
    ]);

    const generator = sut.listFilePathsSorted('.');

    expect(generator.next().value).toBe('a');
    expect(generator.next().value).toBe('b');
    expect(generator.next().done).toBeTruthy();
});

test('listFilePathsSorted should follow directories', () => {
    fs.readdirSync.mockReturnValueOnce([
        dirent('c'),
        dirent('b', true),
        dirent('a'),
    ]);
    fs.readdirSync.mockReturnValueOnce([
        dirent('c'),
        dirent('b'),
        dirent('a'),
    ]);

    const generator = sut.listFilePathsSorted('.');

    ['a', 'b/a', 'b/b', 'b/c', 'c'].forEach((val) => {
        console.log(val)
        expect(generator.next().value).toBe(val)
    });
    expect(generator.next().done).toBeTruthy();
});

function dirent(name, isDir = false) {
    return {
        name,
        isDirectory: () => isDir
    }
}
