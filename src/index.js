import React from 'react';
import ReactDOM from 'react-dom';
import ReactLoading from 'react-loading';
import { TiArrowBackOutline } from "react-icons/ti";
import { TiArrowForwardOutline } from "react-icons/ti";
import './index.css';

class MoviesTotal extends React.Component{
    render() {
        const loadingVisibility = {
            "true": "block",
            "false": 'none'
        }
        return this.props.total > 0 ?
        (
            <div>
                <ReactLoading 
                    type={"spin"} 
                    className={"loadingBar"}
                    style={{display: loadingVisibility[this.props.loading]}}
                />
                <div className="flexContainer" style={{display: this.props.loading ? "none" : 'flex'}}>
                    <button
                        className="iconButton" 
                        onClick={this.props.previousPage}
                        style={{visibility: this.props.currentPage > 0 ? 'visible' : 'hidden'}}
                    ><TiArrowBackOutline /></button>
                    <h3>Movies Found: {this.props.total}</h3>
                    <button 
                        className="iconButton"
                        onClick={this.props.nextPage}
                        style={{visibility: this.props.currentPage < this.props.paginatedResults.length-1 ? 'visible' : 'hidden'}}
                    ><TiArrowForwardOutline /></button>
                </div>
                <div style={{display: this.props.loading ? "none" : 'block'}}>
                    <ul>
                        <li className="list">
                            <strong>Year</strong>
                            <strong>Movies</strong>
                        </li>
                        {this.props.paginatedResults[this.props.currentPage].map( (movie) => {
                            return (
                                <li key={movie.year}>
                                    <a href={void(0)} className="list" onClick={() => this.props.onClickList(movie.year)}><span>{movie.year}</span> <span>{movie.movies}</span></a>
                                </li>
                            );
                        })}
                        <li className="list">
                            <span></span>
                            <span style={{visibility: this.props.showTotal}}>Page: {this.props.currentPage+1}/{this.props.paginatedResults.length}</span>
                        </li>
                    </ul>
                </div>
            </div>
        ):
        (
            <div className="noResults">
                <ReactLoading 
                    type={"spin"}
                    className={"loadingBar"}
                    style={{display: loadingVisibility[this.props.loading]}}
                />
                <span style={{display: loadingVisibility[!this.props.loading]}}>No results found</span>
            </div>  
        );
        
    }
}

function SearchTextBox(props){
    const pholder = "Click \"Search\" for full results.."
    return(
        <input type="text" onBlur={props.lostFocus} placeholder={pholder}/>
    );
}

class SearchMovieList extends React.Component{
    render() {
        return (
            <div className="listContainer">
                <MoviesTotal 
                    total={this.props.total} 
                    paginatedResults={this.props.paginatedResults} 
                    currentPage={this.props.currentPage}
                    showTotal={this.props.showTotal}
                    loading={this.props.loading}
                    nextPage={this.props.nextPage}
                    previousPage={this.props.previousPage}
                    onClickList={year => this.props.onClickList(year)}
                />
            </div>
        );
    }
}

class SearchTools extends React.Component{
    handleClick() {
        this.props.showLoading();
        fetch("http://localhost:8081/api/movies/count" + this.props.searchQuery)
        .then(res => res.json())
        .then(json => {
            if(typeof json.moviesByYear != "undefined"){
                let results = {total: json.total, paginatedResults: []};
                
                json.moviesByYear.forEach((movie, index) => {
                    let i = Math.floor(index/this.props.resultsPerPage);
                    
                    if(typeof results.paginatedResults[i] == "undefined"){
                        results.paginatedResults[i] = [];
                    }

                    results.paginatedResults[i].push(movie);
                })
                return results;
            }
        }, 
        err => console.log(err))
        .then(results => this.props.setResults(results))
        .finally( () => this.props.finishLoading());
    }
    
    render(){
        return(
            <div className="searchContainer">
                <SearchTextBox lostFocus={e => this.props.handleLostFocus(e)} />
                <button onClick={() => this.handleClick()} >Search</button>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props){
        super(props);
        const resultsPerPage = 10
        this.state = {
            "searchQuery": "",
            "resultsPerPage": resultsPerPage,
            "currentPage": 0,
            "paginatedResults": [],
            "total": 0,
            "loading": false,
            "showTotal": 'hidden',
            "currentYear": 0,
            "showDetails": 'hidden'
        }
    }

    handleListClick(year){
        this.setState({
            "currentYear": year,
            "showDetails": "hidden"
        })
    }

    handleLostFocus(event){
        let title = "?Title="+event.currentTarget.value;
        this.setState({searchQuery: title})
    }

    showLoading(){
        this.setState ({
            "currentPage": 0,
            "loading": true,
            "showTotal": 'hidden'
        });
    }

    finishLoading(){
        this.setState ({
            "loading": false,
            "showTotal": 'visible'
        });
    }

    render(){
        return (
            <div className="body">
                <div className="card card-1" style={{visibility: this.state.showDetails}}>
                    <MoviesDetails 
                        year={this.state.currentYear}
                    />
                </div>
                <div className="card card-1">
                    <SearchTools
                        total={this.state.total}
                        paginatedResults={this.state.paginatedResults} 
                        currentPage={this.state.currentPage}
                        resultsPerPage={this.state.resultsPerPage}
                        searchQuery={this.state.searchQuery}
                        handleLostFocus={e => this.handleLostFocus(e)}
                        setResults={results => this.setState(results)}
                        showLoading={() => this.showLoading()}
                        finishLoading={() => this.finishLoading()}
                    />
                    <SearchMovieList 
                        total={this.state.total}
                        showTotal={this.state.showTotal}
                        loading={this.state.loading}
                        paginatedResults={this.state.paginatedResults} 
                        currentPage={this.state.currentPage}
                        previousPage={() => this.setState({currentPage: this.state.currentPage-1})}
                        nextPage={() => this.setState({currentPage: this.state.currentPage+1})}
                        onClickList={year => this.handleListClick(year)}
                    />
                </div>
                <div className="card card-1">
                    teste
                </div>
            </div>
        );
    }
}

// ==========================<>=================================
class MoviesDetails extends React.Component{
    // TODO: Get Movie List By Year *** NOT IMPLEMENTED ***
    render() {
        return (
            <h1>Hellow World</h1>
        );
    }
}
// ==========================<>=================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );