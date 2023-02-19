import React, { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import raw from './repos.csv'

const pageSize = 10;

const Posts = () => {
    const [posts, setposts] = useState();
    const [paginatedPosts, setPaginatedPosts] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState();

    const [file, setFile] = useState();
    const [array, setArray] = useState([]);

    const fileReader = new FileReader();
    const initfileReader = new FileReader();

    useEffect(() => {


        fetch(raw)
            .then(r => r.text())
            .then(text => {
                csvFileToArray(text);

            });


        axios.get('https://jsonplaceholder.typicode.com/todos')
            .then((res) => {
                console.log(res.data);
                setposts(res.data);
                setPaginatedPosts(_(res.data).slice(0).take(pageSize).value());
            })
    }, []);

    const pageCount = posts ? Math.ceil(posts.length / pageSize) : 0;
    if (pageCount === 1) return null;

    const pages = _.range(1, pageCount + 1);

    const pagination = (pageNo) => {
        setCurrentPage(pageNo);
        const startIndex = (pageNo - 1) * pageSize;
        const paginatedPost = _(posts).slice(startIndex).take(pageSize).value();
        setPaginatedPosts(paginatedPost);
    }

    const handleSearch = (event) => {
        setSearch(event.target.value);
        console.log(event.target.value);
    };

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
    };

    const csvFileToArray = string => {
        const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        const tmparray = csvRows.map(i => {
            const values = i.split(",");
            const obj = csvHeader.reduce((object, header, index) => {
                object[header] = values[index];
                return object;
            }, {});
            return obj;
        });

        let fullarray = tmparray.concat(array);

        setArray(fullarray);

        let lineArray = [];
        fullarray.forEach(function (obj, index) {
            let line = '';
            for (let prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    line += obj[prop] + ','
                }
            }
            lineArray.push(line);
        });
        let csvContent = "StoreID,SKU,ProductName,Price,Date\n";
        csvContent += lineArray.join("\n");

        console.log(csvContent)
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        console.log(file)

        if (file) {
            fileReader.onload = function (event) {
                const text = event.target.result;
                csvFileToArray(text);
            };

            fileReader.readAsText(file);
        }
    };

    const headerKeys = Object.keys(Object.assign({}, ...array));


    return (<div>
        {!paginatedPosts ? ("No Data") : (

            <div>
                <div>
                    <input type="text" onChange={handleSearch}></input>
                </div>

                <form>
                    <input
                        type={"file"}
                        id={"csvFileInput"}
                        accept={".csv"}
                        onChange={handleOnChange}
                    />

                    <button
                        onClick={(e) => {
                            handleOnSubmit(e);
                        }}
                    >
                        IMPORT CSV
                    </button>
                </form>

                <table>
                    <thead>
                        <tr key={"header"}>
                            {headerKeys.map((key) => (
                                <th>{key}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {array.map((item) => (
                            <tr key={item.id}>
                                {Object.values(item).map((val) => (
                                    <td>{val}</td>
                                ))}
                                <td><button type="button" className="btn btn-default btn-sm">
                                    <span className="glyphicon glyphicon-edit"></span> Edit
                                </button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        )}

    </div>);

}

export default Posts;