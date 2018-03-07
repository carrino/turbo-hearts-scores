import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ILeague, IPlayer, ISeason } from "../api/api";
import { Api } from "../api/transport";

interface LeaguePageProps extends RouteComponentProps<{ leagueId: string }> {
  api: Api;
}

interface LeaguePageState {
  loading: boolean;
  league: ILeague | undefined;
  players: IPlayer[];
  newSeason: string;
  playerToAdd: string;
}

export class LeaguePage extends React.Component<LeaguePageProps, LeaguePageState> {
  public state: LeaguePageState = {
    loading: false,
    league: undefined,
    players: [],
    newSeason: "",
    playerToAdd: "",
  };

  public render() {
    return (
      <div className="th-league">
        {this.state.league && <h1>{this.state.league.name}</h1>}
        <h3>Choose a Season</h3>
        {this.state.league && this.state.league.seasons.map(this.renderSeason)}
        <input type="text" value={this.state.newSeason} onChange={this.handleNewSeasonChange} />
        <button onClick={this.handleNewSeason} disabled={this.state.newSeason.length === 0}>
          Create a New Season
        </button>
        <h3>Players in this League</h3>
        {this.state.league && this.state.league.players.map(this.renderPlayer)}
        {this.renderAddPlayer()}
      </div>
    );
  }

  public async componentDidMount() {
    this.fetchPlayers();
    this.fetchLeague();
  }

  private renderAddPlayer() {
    return (
      <div>
        <select onChange={this.handlePlayerChooserChange}>
          <option value="">Choose Player</option>
          {this.state.players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <button disabled={this.state.playerToAdd === ""} onClick={this.handleAddPlayer}>
          Add Player To League
        </button>
      </div>
    );
  }

  private async fetchLeague() {
    const leagueId = this.props.match.params.leagueId;
    this.setState({ loading: true });
    const league = await this.props.api.fetchLeague(leagueId);
    this.setState({ loading: false, league });
  }

  private async fetchPlayers() {
    this.setState({ loading: true });
    const players = await this.props.api.fetchPlayers();
    this.setState({ loading: false, players });
  }

  private renderSeason = (season: ISeason) => {
    const nav = () => this.props.history.push(`/season/${season.id}`);
    return (
      <div key={season.id}>
        <a onClick={nav}>{season.name}</a>
      </div>
    );
  };

  private renderPlayer = (player: IPlayer) => {
    return <div key={player.id}>{player.name}</div>;
  };

  private handleNewSeasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newSeason: event.target.value });
  };

  private handlePlayerChooserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ playerToAdd: event.target.value });
  };

  private handleNewSeason = async () => {
    const leagueId = this.props.match.params.leagueId;
    this.setState({ loading: true });
    await this.props.api.createSeason(leagueId, this.state.newSeason);
    this.setState({ loading: false });
    this.fetchLeague();
  };

  private handleAddPlayer = async () => {
    const leagueId = this.props.match.params.leagueId;
    const playerId = this.state.playerToAdd;
    this.setState({ loading: true });
    await this.props.api.addPlayerToLeague(leagueId, playerId);
    this.fetchLeague();
  };
}
